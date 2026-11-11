// Servidor MOCK (somente para testes): serve o repositório em /SGDI/ e imita o contrato
// dos controllers PHP (envelope, perfis 1/2, corpo form-urlencoded, linhas snake_case).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { handleUploads, parseMultipart, cascadeDeleteImages } from "./mock-uploads.mjs";

const ROOT = path.resolve(new URL("../../../", import.meta.url).pathname);
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

export const db = {
    nextId: { users: 10, properties: 10, contracts: 10, appointments: 10, images: 1 },
    files: new Map(), // "disco" do mock: caminho relativo -> { data, type }
    property_images: [],
    users: [
        { id_user: 1, id_user_type: 1, name: "Inquilino Teste", email: "inq@test.com", password: "123456" },
        { id_user: 2, id_user_type: 2, name: "Dono Teste", email: "dono@test.com", password: "123456" },
        { id_user: 3, id_user_type: 2, name: "Outro Dono", email: "dono2@test.com", password: "123456" },
    ],
    properties: [{ id_property: 1, id_owner: 2, location: "Rua das Flores, 100", number_of_rooms: 2, availability: "1", late_payment: "0" }],
    contracts: [],
    appointments: [{ id_appointment: 1, id_property: 1, date: "2026-10-10", observation: "Vistoria inicial", completed: "0" }],
    faqs: [
        { id_faq: 1, id_category: 1, question: "Como criar conta?", answer: "Pelo cadastro. <b>x</b>", active: "1" },
        { id_faq: 2, id_category: 3, question: "Como pagar?", answer: "Via Pix.", active: "1" },
    ],
};
export const flags = { garbageOn: null, failImageInsert: false, failPhotoUpdate: false };

const send = (res, code, type, message, data) => {
    const body = { code, type, status: type === "success" ? "success" : "error", message };
    if (data !== undefined && data !== null) body.data = data;
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
};
const authUser = (req, types) => {
    const m = /^Bearer T-(\d+)$/.exec(req.headers.authorization ?? "");
    const user = m && db.users.find((u) => u.id_user === Number(m[1]));
    return user && types.includes(user.id_user_type) ? user : null;
};

function api(req, res, url, form, files = []) {
    if (handleUploads({ req, res, url, files, form, db, flags, send, authUser })) return;
    const [, resource, action, id] = url.pathname.replace("/SGDI/api", "").split("/");
    const route = `${req.method} /${resource}/${action}`;
    if (flags.garbageOn === route) { res.writeHead(200); return res.end("Warning: Undefined array key<br>{\"code\":200}"); }
    const needs = (types) => { if (authUser(req, types)) return true; send(res, 401, "error", "Token de autenticação inválido ou expirado."); return false; };
    const table = { properties: "id_property", contracts: "id_contract", appointments: "id_appointment" }[resource];

    switch (route) {
        case "POST /users/register": {
            if (!form.name || !form.email || !form.password || !form.type_user) return send(res, 400, "error", "Dados inválidos.");
            if (db.users.some((u) => u.email === form.email)) return send(res, 500, "error", "E-mail já cadastrado.");
            const user = { id_user: db.nextId.users++, id_user_type: +form.type_user, name: form.name, email: form.email, password: form.password };
            db.users.push(user);
            return send(res, 201, "success", "Usuário cadastrado com sucesso.", { id_user: user.id_user, name: user.name, email: user.email, type_user: user.id_user_type });
        }
        case "POST /users/login": {
            if (!form.email || !form.password) return send(res, 400, "error", "E-mail e senha são obrigatórios. O e-mail deve ser válido.");
            const u = db.users.find((x) => x.email === form.email && x.password === form.password);
            if (!u) return send(res, 401, "error", "Credenciais inválidas.");
            return send(res, 200, "success", "Usuário logado com sucesso", { id_user: u.id_user, name: u.name, token: `T-${u.id_user}`, type_user: u.id_user_type });
        }
        case "PUT /users/update": {
            const u = authUser(req, [1, 2]); if (!u) return send(res, 401, "error", "Token de autenticação inválido ou expirado.");
            if (!form.name || !form.email || !form.password) return send(res, 400, "error", "Dados inválidos.");
            Object.assign(u, { name: form.name, email: form.email });
            return send(res, 200, "success", "Usuário atualizado com sucesso.", { id_user: u.id_user, name: u.name, email: u.email });
        }
        case "GET /faqs/list": return send(res, 200, "success", "Lista de FAQs", db.faqs);
    }
    if (table && action === "listAll") return send(res, 200, "success", `Lista de ${resource}`, db[resource]);
    if (table && action === "insert") {
        const roles = resource === "appointments" ? [1] : [2];
        if (!needs(roles)) return;
        const row = { [table]: db.nextId[resource]++ };
        if (resource === "properties") {
            if (!form.location?.trim() || !/^-?\d+$/.test(form.number_of_rooms ?? "")) return send(res, 400, "error", "Dados incorretos ou campos obrigatórios ausentes.");
            Object.assign(row, { id_owner: authUser(req, roles).id_user, location: form.location, number_of_rooms: +form.number_of_rooms, availability: form.availability === "1" ? "1" : "0", late_payment: form.late_payment === "1" ? "1" : "0" });
        } else if (resource === "contracts") {
            if (!form.id_property || !form.rent_value || !form.start_date || form.end_date === undefined || !form.status) return send(res, 400, "error", "Dados incorretos ou campos obrigatórios ausentes.");
            Object.assign(row, { id_property: +form.id_property, id_user: authUser(req, roles).id_user, rent_value: form.rent_value, start_date: form.start_date, end_date: form.end_date, status: form.status });
        } else {
            if (!form.id_property || !form.date || !form.observation || form.completed === undefined) return send(res, 400, "error", "Dados incorretos ou campos obrigatórios ausentes.");
            Object.assign(row, { id_property: +form.id_property, date: form.date, observation: form.observation, completed: form.completed === "1" ? "1" : "0" });
        }
        db[resource].push(row);
        return send(res, 201, "success", "Cadastrado com sucesso!", row);
    }
    if (table && action === "update") {
        if (!needs(resource === "appointments" ? [2] : [2])) return;
        const row = db[resource].find((r) => r[table] === +id);
        if (!row) return send(res, 404, "error", "Registro não encontrado.");
        if (resource === "properties") { if (form.id_property !== id) return send(res, 400, "error", "id_property ausente"); Object.assign(row, { location: form.location, number_of_rooms: +form.number_of_rooms, availability: form.availability === "1" ? "1" : "0", late_payment: form.late_payment === "1" ? "1" : "0" }); }
        else if (resource === "contracts") Object.assign(row, { id_property: +form.id_property, rent_value: form.rent_value, start_date: form.start_date, end_date: form.end_date, status: form.status });
        else { if (Object.keys(form).join() !== "completed") return send(res, 400, "error", "Somente completed é aceito"); row.completed = form.completed === "1" ? "1" : "0"; }
        return send(res, 200, "success", "Atualizado com sucesso");
    }
    if (table && action === "delete") {
        if (!needs(resource === "appointments" ? [1] : [2])) return;
        const i = db[resource].findIndex((r) => r[table] === +id);
        if (i < 0) return send(res, 404, "error", "Registro não encontrado.");
        db[resource].splice(i, 1);
        if (resource === "properties") cascadeDeleteImages(db, +id); // ON DELETE CASCADE + arquivos
        return send(res, 200, "success", "Excluído com sucesso");
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: 404, status: "not_found", message: "URL não encontrada" })); // sem `type`, como o router real
}

export function start(port = 8099) {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, "http://x");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "*, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        if (req.method === "OPTIONS") { res.writeHead(200); return res.end(); }
        if (url.pathname.startsWith("/SGDI/api/uploads/")) {
            const stored = db.files.get(url.pathname.replace("/SGDI/api/", ""));
            if (!stored) { res.writeHead(404); return res.end("not found"); }
            res.writeHead(200, { "Content-Type": stored.type });
            return res.end(stored.data);
        }
        if (url.pathname.startsWith("/SGDI/api/")) {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", () => {
                const raw = Buffer.concat(chunks);
                const type = req.headers["content-type"] ?? "";
                if (raw.length && /^multipart\/form-data; boundary=/.test(type)) {
                    const parsed = parseMultipart(raw, type);
                    return api(req, res, url, parsed.fields, parsed.files);
                }
                if (raw.length && !/x-www-form-urlencoded/.test(type)) return send(res, 400, "error", "Corpo não é form-urlencoded nem multipart (o router PHP não leria)");
                api(req, res, url, Object.fromEntries(new URLSearchParams(raw.toString("utf8"))));
            });
            return;
        }
        const file = path.join(ROOT, url.pathname.replace(/^\/SGDI/, ""));
        if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
        fs.createReadStream(file).pipe(res);
    });
    return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
