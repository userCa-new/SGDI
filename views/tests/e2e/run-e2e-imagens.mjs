// E2E da Etapa 07: node views/tests/e2e/run-e2e-imagens.mjs  (Chromium headless + mock do contrato da API, porta 80)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { start, db, flags } from "./mock-api.mjs";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PATH ?? "puppeteer-core");
const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const BASE = "http://localhost/SGDI/views/assets";
const OUT = path.resolve(new URL("../../../docs/evidencias/", import.meta.url).pathname);
const FIX = fs.mkdtempSync(path.join(os.tmpdir(), "sgdi-fixtures-"));
fs.mkdirSync(OUT, { recursive: true });

/* ---------- fixtures: imagens reais e arquivos inválidos ---------- */
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body)); return Buffer.concat([len, body, crc]); };
function png(w, h, from, to) { // PNG degradê (válido, decodificável)
    const rows = [];
    for (let y = 0; y < h; y++) { const row = Buffer.alloc(1 + w * 3); for (let x = 0; x < w; x++) for (let i = 0; i < 3; i++) row[1 + x * 3 + i] = Math.round(from[i] + ((to[i] - from[i]) * (x / w + y / h)) / 2); rows.push(row); }
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
    return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))]);
}
const write = (name, data) => { const p = path.join(FIX, name); fs.writeFileSync(p, data); return p; };
const F = {
    sala: write("sala.png", png(320, 200, [224, 123, 57], [90, 40, 20])),
    cozinha: write("cozinha.png", png(320, 200, [60, 160, 120], [10, 60, 70])),
    quarto: write("quarto.png", png(320, 200, [90, 120, 220], [30, 20, 90])),
    perfil: write("perfil.png", png(200, 200, [200, 80, 140], [60, 20, 80])),
    perfil2: write("perfil2.png", png(200, 200, [240, 200, 60], [120, 70, 10])),
    jpg: write("fachada.jpg", Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", "base64")),
    webp: write("piso.webp", Buffer.from("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==", "base64")),
    falsa: write("falsa.png", "isto é texto, não imagem"),
    corrompida: write("corrompida.png", Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from("lixo lixo lixo lixo")])),
    grande: write("grande.png", Buffer.concat([png(10, 10, [0, 0, 0], [9, 9, 9]), Buffer.alloc(5 * 1024 * 1024)])),
    pdf: write("contrato.pdf", "%PDF-1.4 fake"),
};

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const filesIn = (folder) => [...db.files.keys()].filter((k) => k.startsWith(`uploads/${folder}/`));

const server = await start(80);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 1500 });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("dialog", (d) => d.accept());
if (process.env.E2E_DEBUG) page.on("response", (r) => r.url().includes("/api/") && console.log("  [http]", r.request().method(), r.url().replace("http://localhost/SGDI/api", ""), r.status()));

const PAGE_TOAST = "body > .sgdi-toast-region";
const goto = (p) => page.goto(`${BASE}/${p}`, { waitUntil: "networkidle0" });
const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
const clearToasts = () => page.evaluate(() => document.querySelectorAll(".sgdi-toast").forEach((t) => t.remove()));
const waitToast = async (scope, text) => {
    await page.waitForFunction((s, t) => document.querySelector(`${s} .sgdi-toast`)?.textContent.includes(t), { timeout: 5000 }, scope, text);
    return page.$eval(`${scope} .sgdi-toast`, (el) => ({ text: el.textContent, cls: el.className.replace("sgdi-toast ", "") }));
};
const pickFiles = async (sel, ...paths) => (await page.$(sel)).uploadFile(...paths);
const loginAs = async (userId) => {
    const user = db.users.find((u) => u.id_user === userId);
    await goto("public/login.html");
    await page.evaluate((id, u) => { localStorage.clear(); localStorage.setItem("token", `T-${id}`); localStorage.setItem("sgdi_user", JSON.stringify({ id_user: u.id_user, name: u.name, email: u.email, type_user: u.id_user_type })); }, userId, user);
    await goto("app/manage.html");
    await page.waitForSelector('#gallery-property option[value="1"]');
};
const galleryCount = () => page.$$eval("#gallery-list .gallery-item", (f) => f.length);
const waitGallery = (n) => page.waitForFunction((count) => document.querySelectorAll("#gallery-list .gallery-item").length === count, { timeout: 5000 }, n);
const imagesLoaded = () => page.$$eval("#gallery-list .gallery-item img", (imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0));
const visible = (sel) => page.$eval(sel, (el) => !el.hidden && getComputedStyle(el).display !== "none");

try {
    /* =================== PARTE A — foto do usuário autenticado =================== */
    await loginAs(2);
    check("Perfil: sem foto, mostra o ícone de reserva (inicial do nome)", (await visible("#photo-fallback")) && !(await visible("#photo-current")) && (await page.$eval("#photo-fallback", (e) => e.textContent)) === "D");
    check("Perfil: regras de formato/limite visíveis", (await page.$eval("#photo-rules", (e) => e.textContent)).includes("JPG, PNG ou WebP"));
    check("Perfil: botão Enviar foto começa desabilitado", await page.$eval("#photo-form button[type=submit]", (b) => b.disabled));

    for (const [label, file, fragment] of [["texto renomeado .png", F.falsa, "não tem conteúdo de imagem"], ["PDF", F.pdf, "não é JPG, PNG ou WebP"], ["PNG > 5 MB", F.grande, "excede 5 MB"]]) {
        await clearToasts(); await pickFiles("#photo-input", file);
        const t = await waitToast("#profile-section", fragment);
        check(`Foto: bloqueia no frontend (${label})`, t.cls === "sgdi-toast--warning" && !(await visible("#photo-preview-box")) && (await page.$eval("#photo-form button[type=submit]", (b) => b.disabled)), t.text);
    }

    await clearToasts(); await pickFiles("#photo-input", F.perfil);
    await page.waitForFunction(() => !document.querySelector("#photo-preview-box").hidden);
    check("Foto: prévia aparece ANTES do envio e nada foi gravado ainda", (await visible("#photo-preview-box")) && !db.users[1].photo && filesIn("users").length === 0);
    await shot("07a-foto-previa");
    await page.click("#photo-form button[type=submit]");
    const tPhoto = await waitToast("#profile-section", "Foto atualizada");
    await page.waitForFunction(() => { const i = document.querySelector("#photo-current"); return !i.hidden && i.complete && i.naturalWidth > 0; }, { timeout: 5000 });
    const photoSrc = await page.$eval("#photo-current", (i) => i.src);
    check("Foto: toast verde e imagem atual exibida (carregou de verdade)", tPhoto.cls === "sgdi-toast--success" && photoSrc.startsWith("http://localhost/SGDI/api/uploads/users/"), photoSrc);
    check("Foto: persistida no perfil do TOKEN (caminho relativo) e prévia some", /^uploads\/users\/[a-f0-9]{32}\.png$/.test(db.users[1].photo) && !(await visible("#photo-preview-box")));
    const req = db.lastPhotoRequest;
    check("Foto: multipart com boundary gerado pelo navegador + Bearer", /^multipart\/form-data; boundary=/.test(req.contentType) && req.authorization === "Bearer T-2", req.contentType);
    check("Foto: o corpo NÃO carrega id de usuário (identidade vem do token)", Object.keys(req.fields).length === 0);
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => { const i = document.querySelector("#photo-current"); return !i.hidden && i.complete && i.naturalWidth > 0; }, { timeout: 5000 });
    check("Foto: continua exibida depois de atualizar a página (GET /users/me)", (await page.$eval("#photo-current", (i) => i.src)) === photoSrc);
    await shot("07b-foto-apos-reload");

    const previous = db.users[1].photo;
    await pickFiles("#photo-input", F.perfil2); await page.waitForFunction(() => !document.querySelector("#photo-preview-box").hidden);
    await clearToasts(); await page.click("#photo-form button[type=submit]"); await waitToast("#profile-section", "Foto atualizada"); await sleep(200);
    check("Foto: trocar a foto remove o arquivo antigo (só depois do UPDATE)", db.users[1].photo !== previous && !db.files.has(previous) && filesIn("users").length === 1);

    const before = { photo: db.users[1].photo, files: filesIn("users").length };
    await pickFiles("#photo-input", F.corrompida); await page.waitForFunction(() => !document.querySelector("#photo-preview-box").hidden);
    await clearToasts(); await page.click("#photo-form button[type=submit]");
    const tBad = await waitToast("#profile-section", "não é uma imagem válida");
    check("Foto: arquivo rejeitado pelo BACKEND vira erro vermelho e não altera nada", tBad.cls === "sgdi-toast--error" && db.users[1].photo === before.photo && filesIn("users").length === before.files);
    flags.failPhotoUpdate = true;
    await clearToasts(); await pickFiles("#photo-input", F.perfil); await page.waitForFunction(() => !document.querySelector("#photo-preview-box").hidden);
    await page.click("#photo-form button[type=submit]");
    const tFail = await waitToast("#profile-section", "Não foi possível atualizar a foto");
    flags.failPhotoUpdate = false;
    check("Foto: falha de persistência = erro, e o arquivo novo é removido (sem órfão)", tFail.cls === "sgdi-toast--error" && filesIn("users").length === before.files && db.users[1].photo === before.photo);
    await page.$eval("#photo-form [data-action=cancel]", (b) => b.click());

    /* =================== PARTE B — galeria 1:N =================== */
    await goto("app/manage.html"); await page.waitForSelector('#gallery-property option[value="1"]');
    check("Galeria: regras e limites exibidos", (await page.$eval("#gallery-rules", (e) => e.textContent)).includes("até 5 MB") && (await page.$eval("#gallery-rules", (e) => e.textContent)).includes("máximo de 20"));
    check("Galeria: antes de escolher o imóvel, só a orientação", (await page.$eval("#gallery-list", (e) => e.textContent)).includes("Selecione um imóvel") && !(await visible("#gallery-form")));
    await page.select("#gallery-property", "1");
    await page.waitForFunction(() => document.querySelector("#gallery-list").textContent.includes("ainda não tem imagens"));
    check("Galeria: imóvel sem imagens mostra a lista vazia", (await page.evaluate(() => location.hash)) === "#galeria-1" && (await visible("#gallery-form")));

    await pickFiles("#gallery-files", F.sala, F.cozinha);
    await page.waitForFunction(() => document.querySelectorAll("#gallery-pending .pending-item").length === 2);
    check("Galeria: 2 prévias antes do envio; contador e botão habilitado", (await page.$eval("#gallery-counter", (e) => e.textContent)).includes("2 imagem") && !(await page.$eval("#gallery-form button[type=submit]", (b) => b.disabled)) && db.property_images.length === 0);
    const xss = '<img src=x onerror="window.__xss=1"> Sala';
    const alts = await page.$$("#gallery-pending input[data-alt]");
    await alts[0].type(xss.slice(0, 80)); await alts[1].type("Cozinha integrada");
    await clearToasts(); await page.click("#gallery-form button[type=submit]");
    const tUp = await waitToast(PAGE_TOAST, "2 imagens enviadas");
    await waitGallery(2); await sleep(300);
    check("Galeria: envio de 2 imagens (1 requisição multipart) → toast verde", tUp.cls === "sgdi-toast--success", tUp.text);
    check("Galeria: 2 registros em property_images com id_property=1 e arquivos gravados", db.property_images.length === 2 && db.property_images.every((i) => i.id_property === 1 && /^uploads\/properties\/[a-f0-9]{32}\.png$/.test(i.image_path)) && filesIn("properties").length === 2);
    check("Galeria: a requisição usou images[] em multipart com Bearer", db.lastImagesRequest.fieldNames.join() === "images,images" && /^multipart\/form-data; boundary=/.test(db.lastImagesRequest.contentType) && db.lastImagesRequest.authorization === "Bearer T-2");
    check("Galeria: imagens renderizadas e carregadas; prévias descartadas", (await imagesLoaded()) && (await page.$$("#gallery-pending .pending-item")).length === 0);
    check("Galeria: texto alternativo é exibido como TEXTO (sem executar HTML)", (await page.$$("#gallery-list figcaption img")).length === 0 && (await page.evaluate(() => window.__xss)) === undefined && (await page.$eval("#gallery-list .gallery-item figcaption span", (s) => s.textContent)).includes("<img src=x"));
    await shot("08a-galeria-2-imagens");

    await page.reload({ waitUntil: "networkidle0" });
    await waitGallery(2); await sleep(300);
    check("Galeria: depois de ATUALIZAR a página o imóvel e as 2 imagens voltam do banco (#galeria-1)", (await galleryCount()) === 2 && (await page.$eval("#gallery-property", (s) => s.value)) === "1" && (await imagesLoaded()));
    await shot("08b-galeria-apos-reload");

    await pickFiles("#gallery-files", F.jpg, F.webp); await page.waitForFunction(() => document.querySelectorAll("#gallery-pending .pending-item").length === 2);
    await clearToasts(); await page.click("#gallery-form button[type=submit]"); await waitToast(PAGE_TOAST, "2 imagens enviadas"); await waitGallery(4);
    check("Galeria: JPG e WebP também são aceitos; posições sequenciais 0..3", db.property_images.length === 4 && db.property_images.map((i) => i.position).join() === "0,1,2,3");

    const removedId = Number(await page.$eval("#gallery-list .gallery-item:nth-child(2)", (f) => f.dataset.imageId));
    const keptIds = db.property_images.map((i) => i.id_image).filter((id) => id !== removedId);
    const filesBefore = filesIn("properties").length;
    await clearToasts(); await page.$eval("#gallery-list .gallery-item:nth-child(2) button[data-remove]", (b) => b.click());
    const tDel = await waitToast(PAGE_TOAST, "Imagem removida"); await waitGallery(3);
    check("Galeria: remover UMA imagem preserva as demais (registros e arquivos)", tDel.cls === "sgdi-toast--success" && db.property_images.map((i) => i.id_image).join() === keptIds.join() && filesIn("properties").length === filesBefore - 1);

    // lote misto: backend rejeita tudo (tudo-ou-nada)
    const stateBefore = { rows: db.property_images.length, files: filesIn("properties").length };
    await pickFiles("#gallery-files", F.quarto, F.corrompida); await page.waitForFunction(() => document.querySelectorAll("#gallery-pending .pending-item").length === 2);
    await clearToasts(); await page.click("#gallery-form button[type=submit]");
    const tMix = await waitToast(PAGE_TOAST, "Imagem 2");
    check("Galeria: arquivo rejeitado pelo backend → erro, NADA associado ao imóvel e nenhum arquivo órfão", tMix.cls === "sgdi-toast--error" && db.property_images.length === stateBefore.rows && filesIn("properties").length === stateBefore.files, tMix.text);
    check("Galeria: após o erro a seleção continua para corrigir (2 cards)", (await page.$$("#gallery-pending .pending-item")).length === 2);
    await shot("08c-erro-backend");
    await page.$eval("#gallery-pending .pending-item:nth-child(2) button[data-pending]", (b) => b.click());
    await clearToasts(); await page.click("#gallery-form button[type=submit]"); await waitToast(PAGE_TOAST, "Imagem enviada"); await waitGallery(4);
    check("Galeria: descartar o inválido e reenviar funciona", db.property_images.length === 4);

    // falha de banco: nenhum arquivo novo sem referência
    flags.failImageInsert = true;
    const s2 = { rows: db.property_images.length, files: filesIn("properties").length };
    await pickFiles("#gallery-files", F.sala, F.cozinha); await page.waitForFunction(() => document.querySelectorAll("#gallery-pending .pending-item").length === 2);
    await clearToasts(); await page.click("#gallery-form button[type=submit]");
    const tDb = await waitToast(PAGE_TOAST, "Nenhuma imagem foi salva"); flags.failImageInsert = false;
    check("Galeria: falha no banco → erro e os arquivos já gravados são removidos", tDb.cls === "sgdi-toast--error" && db.property_images.length === s2.rows && filesIn("properties").length === s2.files);
    await page.$eval("#gallery-form [data-action=clear]", (b) => b.click());

    // validações do frontend
    await clearToasts(); await pickFiles("#gallery-files", F.falsa, F.pdf, F.grande);
    const tFe = await waitToast(PAGE_TOAST, "excede 5 MB");
    check("Galeria: arquivos inválidos são barrados na seleção (texto renomeado, PDF, > 5 MB)", tFe.cls === "sgdi-toast--warning" && tFe.text.includes("não tem conteúdo de imagem") && tFe.text.includes("não é JPG, PNG ou WebP") && (await page.$$("#gallery-pending .pending-item")).length === 0);
    await clearToasts(); await pickFiles("#gallery-files", ...Array(11).fill(F.perfil));
    await waitToast(PAGE_TOAST, "Limite");
    check("Galeria: no máximo 10 imagens por envio", (await page.$$("#gallery-pending .pending-item")).length === 10);
    await page.$eval("#gallery-form [data-action=clear]", (b) => b.click());

    /* ---- autorização: imóvel de outro proprietário ---- */
    db.properties.push({ id_property: 2, id_owner: 3, location: "Av. do Outro Dono, 7", number_of_rooms: 1, availability: "1", late_payment: "0" });
    db.property_images.push({ id_image: db.nextId.images++, id_property: 2, image_path: (() => { const rel = "uploads/properties/" + "c".repeat(32) + ".png"; db.files.set(rel, { data: fs.readFileSync(F.quarto), type: "image/png" }); return rel; })(), alt_text: "Quarto do outro dono", position: 0, created_at: "2026-01-01 00:00:00" });
    await page.reload({ waitUntil: "networkidle0" }); await page.waitForSelector('#gallery-property option[value="2"]');
    await page.select("#gallery-property", "2"); await waitGallery(1);
    check("Autorização (UI): imóvel de outro dono → lista visível, sem formulário de envio e sem botão remover", !(await visible("#gallery-form")) && (await page.$$("#gallery-list button[data-remove]")).length === 0);
    const foreign = db.property_images.find((i) => i.id_property === 2).id_image;
    const mine = db.property_images.find((i) => i.id_property === 1).id_image;
    const direct = await page.evaluate(async (foreignId, mineId) => {
        const h = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const api = "http://localhost/SGDI/api";
        const fd = new FormData(); fd.append("images[]", new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "a.png"));
        const post = await fetch(`${api}/properties/2/images`, { method: "POST", headers: h, body: fd });
        const del = await fetch(`${api}/properties/2/images/${foreignId}`, { method: "DELETE", headers: h });
        const cross = await fetch(`${api}/properties/1/images/${foreignId}`, { method: "DELETE", headers: h });
        const noAuth = await fetch(`${api}/properties/1/images/${mineId}`, { method: "DELETE" });
        const noProp = await fetch(`${api}/properties/999/images`);
        return [post.status, del.status, cross.status, noAuth.status, noProp.status];
    }, foreign, mine);
    check("Autorização (API): POST/DELETE em imóvel alheio = 403; imagem de outro imóvel pelo id errado = 404; sem token = 401; imóvel inexistente = 404", direct.join() === "403,403,404,401,404", direct.join());
    check("Autorização (API): nada foi alterado no imóvel alheio nem no imóvel 1", db.property_images.filter((i) => i.id_property === 2).length === 1 && db.property_images.filter((i) => i.id_property === 1).length === 4);

    /* ---- Inquilino: foto sim, galeria só leitura ---- */
    await loginAs(1);
    await page.select("#gallery-property", "1"); await waitGallery(4);
    check("Inquilino: vê a galeria, sem formulário de envio nem remover", !(await visible("#gallery-form")) && (await page.$$("#gallery-list button[data-remove]")).length === 0);
    const tenantPost = await page.evaluate(async () => { const fd = new FormData(); fd.append("images[]", new File([new Uint8Array([1])], "a.png")); return (await fetch("http://localhost/SGDI/api/properties/1/images", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd })).status; });
    check("Inquilino: POST de imagens de imóvel = 401 no backend", tenantPost === 401);
    await pickFiles("#photo-input", F.perfil2); await page.waitForFunction(() => !document.querySelector("#photo-preview-box").hidden);
    await clearToasts(); await page.click("#photo-form button[type=submit]"); await waitToast("#profile-section", "Foto atualizada");
    check("Inquilino: qualquer perfil autenticado atualiza a própria foto", /^uploads\/users\//.test(db.users[0].photo) && db.users[1].photo !== db.users[0].photo);

    /* ---- exclusão do imóvel não deixa arquivos órfãos ---- */
    await loginAs(2);
    await page.$eval('#property-list tbody tr:nth-child(1) button[data-action="delete"]', (b) => b.click()); await sleep(800);
    check("Excluir o imóvel remove registros E arquivos da galeria (sem órfãos)", !db.property_images.some((i) => i.id_property === 1) && filesIn("properties").length === 1 /* só a do imóvel 2 */);
    await page.select("#gallery-property", "2"); await waitGallery(1);
    check("Console do navegador sem erros inesperados", consoleErrors.filter((e) => !/status of (4|5)\d\d|Failed to load resource/.test(e) && !/\[Toast\]|\[PropertyImage\]/.test(e)).length === 0, consoleErrors.slice(0, 3).join(" | "));
} catch (error) {
    check("Exceção no roteiro E2E", false, error.message.split("\n")[0]);
    if (process.env.E2E_DEBUG) console.log("fixture", fs.statSync(F.perfil).size, "armazenado", db.files.get(db.users[1].photo)?.data.length, "iguais", db.files.get(db.users[1].photo)?.data.equals(fs.readFileSync(F.perfil)));
    if (process.env.E2E_DEBUG) console.log(await page.evaluate(() => ({ toasts: [...document.querySelectorAll(".sgdi-toast")].map((t) => t.textContent), photo: (() => { const i = document.querySelector("#photo-current"); return { hidden: i.hidden, src: i.src, complete: i.complete, nw: i.naturalWidth }; })() })));
    await shot("zz-falha");
} finally {
    const failed = results.filter((r) => !r.ok);
    const md = ["# Evidências automáticas — Etapa 07 (upload de imagens)", "", "Chromium headless contra o servidor mock que imita o contrato da API (`views/tests/e2e/mock-uploads.mjs`). Imagens reais (PNG/JPG/WebP) enviadas por `<input type=file>`.", "", "| # | Verificação | Resultado |", "|---|---|---|", ...results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.ok ? "✅" : "❌"} |`), "", `**${results.length - failed.length}/${results.length} verificações passaram.**`];
    fs.writeFileSync(path.join(OUT, "e2e-imagens-resultados.md"), md.join("\n") + "\n");
    console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`);
    await browser.close(); server.close?.();
    process.exit(failed.length ? 1 : 0);
}
