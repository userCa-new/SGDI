// MOCK de upload (somente para testes). Reproduz, em Node, o contrato e as regras de
// Users::uploadPhoto/Users::me e PropertyImages (listar, enviar, remover) do backend PHP:
// multipart, validação do conteúdo (como finfo/getimagesize), tudo-ou-nada, posse do imóvel.
import crypto from "node:crypto";

export const LIMITS = { maxBytes: 5 * 1024 * 1024, perRequest: 10, perProperty: 20, alt: 255 };
const API = "http://localhost/SGDI/api";
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
const MANAGED = /^uploads\/(users|properties)\/[a-f0-9]{32}\.(jpg|png|webp)$/;

export function parseMultipart(buffer, contentType) {
    const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType ?? "");
    if (!m) return null;
    const boundary = Buffer.from("--" + (m[1] ?? m[2]));
    const fields = {};
    const files = [];
    let pos = buffer.indexOf(boundary);
    while (pos !== -1) {
        const next = buffer.indexOf(boundary, pos + boundary.length);
        if (next === -1) break;
        let part = buffer.subarray(pos + boundary.length, next);
        if (part.subarray(0, 2).toString() === "\r\n") part = part.subarray(2);
        if (part.subarray(part.length - 2).toString() === "\r\n") part = part.subarray(0, part.length - 2);
        const headerEnd = part.indexOf("\r\n\r\n");
        const head = part.subarray(0, headerEnd).toString("utf8");
        const body = part.subarray(headerEnd + 4);
        const name = /name="([^"]*)"/.exec(head)?.[1] ?? "";
        const filename = /filename="([^"]*)"/.exec(head);
        if (filename) files.push({ field: name.replace(/\[\]$/, ""), filename: filename[1], data: body }); // PHP remove os colchetes de $_FILES
        else if (name.endsWith("[]")) (fields[name.slice(0, -2)] ??= []).push(body.toString("utf8"));
        else fields[name] = body.toString("utf8");
        pos = next;
    }
    return { fields, files };
}

/** Equivalente a Upload::image(): tamanho + tipo real do conteúdo + imagem íntegra. */
function inspect(file) {
    if (file.filename === "") return { error: "Nenhum arquivo foi enviado." };
    const b = file.data;
    if (b.length > LIMITS.maxBytes) return { error: "O arquivo excede o tamanho máximo permitido." };
    let ext = null;
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ext = "jpg";
    else if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ext = "png";
    else if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") ext = "webp";
    if (!ext) return { error: "O tipo do arquivo enviado não é permitido." };
    if (ext === "png" && b.subarray(12, 16).toString() !== "IHDR") return { error: "O conteúdo enviado não é uma imagem válida." };
    return { ext };
}

const store = (db, file, folder, ext) => {
    const rel = `uploads/${folder}/${crypto.randomBytes(16).toString("hex")}.${ext}`;
    db.files.set(rel, { data: file.data, type: MIME[ext] });
    return rel;
};
export const removeFile = (db, rel) => (MANAGED.test(rel ?? "") ? db.files.delete(rel) || true : false);
const urlOf = (rel) => (rel ? `${API}/${rel}` : null);
const present = (r) => ({ id_image: r.id_image, id_property: r.id_property, path: r.image_path, url: urlOf(r.image_path), alt_text: r.alt_text, position: r.position, created_at: r.created_at });
const parseId = (v) => (/^[1-9]\d*$/.test(String(v ?? "")) ? Number(v) : null);

/** Remove os registros (cascade) e os arquivos de um imóvel excluído. */
export function cascadeDeleteImages(db, propertyId) {
    const mine = db.property_images.filter((i) => i.id_property === propertyId);
    db.property_images = db.property_images.filter((i) => i.id_property !== propertyId);
    mine.forEach((i) => removeFile(db, i.image_path));
}

/** @returns {boolean} true quando a rota foi tratada aqui */
export function handleUploads({ req, res, url, files, form, db, flags, send, authUser }) {
    const path = url.pathname.replace("/SGDI/api", "");

    if (req.method === "GET" && path === "/users/me") {
        const user = authUser(req, [1, 2]);
        if (!user) return send(res, 401, "error", "Token de autenticação inválido ou expirado."), true;
        send(res, 200, "success", "Perfil do usuário autenticado", { id_user: user.id_user, name: user.name, email: user.email, type_user: user.id_user_type, photo: urlOf(user.photo) });
        return true;
    }

    if (req.method === "POST" && path === "/users/photo") {
        const user = authUser(req, [1, 2]);
        if (!user) return send(res, 401, "error", "Usuário não está autenticado (sem token ou token inválido)."), true;
        db.lastPhotoRequest = { fields: { ...form }, contentType: req.headers["content-type"], authorization: req.headers.authorization };
        const file = files.find((f) => f.field === "photo");
        if (!file) return send(res, 400, "error", "Selecione uma imagem para enviar."), true;
        const info = inspect(file);
        if (info.error) return send(res, 400, "error", info.error), true;
        const rel = store(db, file, "users", info.ext);
        if (flags.failPhotoUpdate) {
            removeFile(db, rel); // falha ao persistir: o arquivo novo não fica órfão
            return send(res, 500, "error", "Não foi possível atualizar a foto do perfil."), true;
        }
        const old = user.photo;
        user.photo = rel; // SEMPRE o usuário do token
        if (old) removeFile(db, old); // arquivo antigo só some depois do UPDATE
        send(res, 200, "success", "Foto atualizada com sucesso.", { photo: urlOf(rel) });
        return true;
    }

    const m = /^\/properties\/([^/]+)\/images(?:\/([^/]+))?$/.exec(path);
    if (!m) return false;
    const propertyId = parseId(m[1]);

    if (req.method === "GET" && m[2] === undefined) {
        if (propertyId === null) return send(res, 400, "error", "O id do imóvel é obrigatório e deve ser um número inteiro positivo."), true;
        const user = authUser(req, [1, 2]);
        if (!user) return send(res, 401, "error", "Token de autenticação inválido ou expirado."), true;
        const property = db.properties.find((p) => p.id_property === propertyId);
        if (!property) return send(res, 404, "error", "Imóvel não encontrado."), true;
        const allowed = user.id_user_type === 2
            ? property.id_owner === user.id_user
            : db.contracts.some((contract) =>
                contract.id_property === propertyId &&
                contract.id_user === user.id_user &&
                contract.status === "ACTIVE");
        if (!allowed) return send(res, 404, "error", "Imóvel não encontrado para este usuário."), true;
        const rows = db.property_images.filter((i) => i.id_property === propertyId).sort((a, b) => a.position - b.position || a.id_image - b.id_image);
        send(res, 200, "success", "Galeria do imóvel", { id_property: propertyId, total: rows.length, images: rows.map(present) });
        return true;
    }

    if (req.method !== "POST" && req.method !== "DELETE") return false;
    const owner = authUser(req, [2]);
    if (!owner) return send(res, 401, "error", "Token de autenticação inválido ou expirado."), true;
    if (propertyId === null) return send(res, 400, "error", "O id do imóvel é obrigatório e deve ser um número inteiro positivo."), true;
    const property = db.properties.find((p) => p.id_property === propertyId);
    if (!property) return send(res, 404, "error", "Imóvel não encontrado."), true;
    if (property.id_owner !== owner.id_user) return send(res, 403, "error", "Você não tem permissão para alterar as imagens deste imóvel."), true;

    if (req.method === "DELETE") {
        const imageId = parseId(m[2]);
        if (imageId === null) return send(res, 400, "error", "O id da imagem é obrigatório e deve ser um número inteiro positivo."), true;
        const index = db.property_images.findIndex((i) => i.id_image === imageId && i.id_property === propertyId); // escopo do imóvel
        if (index < 0) return send(res, 404, "error", "Imagem não encontrada neste imóvel."), true;
        const [row] = db.property_images.splice(index, 1);
        removeFile(db, row.image_path); // registro primeiro, arquivo depois
        send(res, 200, "success", "Imagem removida com sucesso.", { id_image: imageId, id_property: propertyId });
        return true;
    }

    // POST /properties/{id}/images
    db.lastImagesRequest = { contentType: req.headers["content-type"], authorization: req.headers.authorization, fieldNames: files.map((f) => f.field) };
    const mine = files.filter((f) => f.field === "images" || f.field === "image");
    if (mine.filter((f) => f.filename !== "").length === 0) return send(res, 400, "error", "Selecione ao menos uma imagem para enviar."), true;
    if (mine.length > LIMITS.perRequest) return send(res, 400, "error", `Envie no máximo ${LIMITS.perRequest} imagens por requisição.`), true;
    const alts = (Array.isArray(form.alt_text) ? form.alt_text : [form.alt_text]).filter((a) => a !== undefined);
    if (alts.some((a) => [...a].length > LIMITS.alt)) return send(res, 400, "error", `O texto alternativo deve ter no máximo ${LIMITS.alt} caracteres.`), true;
    const current = db.property_images.filter((i) => i.id_property === propertyId);
    if (current.length + mine.length > LIMITS.perProperty) return send(res, 400, "error", `Cada imóvel aceita no máximo ${LIMITS.perProperty} imagens (já possui ${current.length}).`), true;

    const position = current.length ? Math.max(...current.map((i) => i.position)) + 1 : 0;
    const savedFiles = [];
    const created = [];
    const abort = () => savedFiles.forEach((rel) => removeFile(db, rel)); // rollback: arquivos E registros ficam como estavam
    for (const [index, file] of mine.entries()) {
        const info = inspect(file);
        if (info.error) {
            abort();
            return send(res, 400, "error", `Imagem ${index + 1} (${file.filename.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 60)}): ${info.error}`), true;
        }
        const rel = store(db, file, "properties", info.ext);
        savedFiles.push(rel);
        if (flags.failImageInsert && index === 1) {
            abort();
            return send(res, 500, "error", "Não foi possível registrar as imagens no banco de dados. Nenhuma imagem foi salva."), true;
        }
        created.push({ id_image: db.nextId.images++, id_property: propertyId, image_path: rel, alt_text: (alts[index] ?? "").trim() || null, position: position + index, created_at: new Date().toISOString().slice(0, 19).replace("T", " ") });
    }
    db.property_images.push(...created);
    send(res, 201, "success", created.length === 1 ? "Imagem enviada com sucesso." : `${created.length} imagens enviadas com sucesso.`, { id_property: propertyId, total: created.length, images: created.map(present) });
    return true;
}
