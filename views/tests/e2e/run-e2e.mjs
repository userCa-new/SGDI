// E2E: node views/tests/e2e/run-e2e.mjs  (requer puppeteer + Chromium; usa a porta 80 como o backend real)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { start, db, flags } from "./mock-api.mjs";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PATH ?? "puppeteer-core");
const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost/SGDI/views/assets";
const OUT = path.resolve(new URL("../../../docs/evidencias/", import.meta.url).pathname);
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await start(80);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 1400 });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("dialog", (d) => d.accept());

const goto = (p) => page.goto(`${BASE}/${p}`, { waitUntil: "networkidle0" });
const set = (sel, value) => page.$eval(sel, (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); }, value);
// antes de cada envio, limpa toasts antigos para não ler uma mensagem obsoleta
const click = async (sel) => {
    if (sel.includes('type="submit"')) await page.evaluate(() => document.querySelectorAll(".sgdi-toast").forEach((t) => t.remove()));
    return page.click(sel);
};
const toast = async (scope = "body > .sgdi-toast-region") => {
    await page.waitForSelector(`${scope} .sgdi-toast`, { timeout: 4000 });
    return page.$eval(`${scope} .sgdi-toast`, (el) => ({ text: el.textContent, cls: el.className.replace("sgdi-toast ", "") }));
};
const rows = (sel) => page.$$eval(`${sel} tbody tr`, (trs) => trs.map((tr) => [...tr.cells].map((c) => c.textContent)));
const settle = () => sleep(500);
const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
const clickRowAction = (listSel, rowIndex, action) => page.$eval(`${listSel} tbody tr:nth-child(${rowIndex + 1}) button[data-action="${action}"]`, (b) => b.click());
const login = async (email, password) => {
    await page.evaluate(() => localStorage.clear());
    await goto("public/login.html");
    await set("#email", email); await set("#senha", password);
    await click('#login-form button[type="submit"]');
};

try {
    // A) FAQ pela FaqService, sem onclick, sem injeção de HTML
    await goto("public/faq.html");
    await page.waitForSelector(".faq-category-con .faq-item");
    check("FAQ: itens agrupados por id_category", (await page.$$(".faq-category-con .faq-item")).length === 1 && (await page.$$(".faq-category-inq .faq-item")).length === 1);
    check("FAQ: HTML da resposta é texto (sem injeção)", await page.$eval(".faq-category-con .faq-answer p", (p) => p.textContent.includes("<b>x</b>") && !p.querySelector("b")));
    await click(".faq-category-con .faq-question");
    check("FAQ: clique expande resposta (delegação de eventos)", await page.$eval(".faq-category-con .faq-answer", (a) => a.classList.contains("show")));
    check("FAQ: nenhum atributo onclick no DOM", (await page.$$("[onclick]")).length === 0);

    // B) Cadastro
    await goto("public/cadastro.html");
    await set("#nome", "Novo Usuário"); await set("#email-signup", "novo@test.com"); await set("#tipo", "inquilino"); await set("#senha-signup", "abcdef");
    await click('#signup-form button[type="submit"]');
    const t1 = await toast("#signup-form");
    check("Cadastro: toast verde com a mensagem da API", t1.cls === "sgdi-toast--success" && t1.text === "Usuário cadastrado com sucesso.", t1.text);
    check("Cadastro: usuário gravado com tipo 1", db.users.at(-1)?.email === "novo@test.com" && db.users.at(-1).id_user_type === 1);
    check("Cadastro: senha não vai para sessionStorage", !(await page.evaluate(() => JSON.stringify({ ...sessionStorage }))).includes("abcdef"));

    // C/D) Login inválido e válido
    await login("dono@test.com", "errada");
    const t2 = await toast("#login-form");
    check("Login inválido: toast vermelho com mensagem do backend", t2.cls === "sgdi-toast--error" && t2.text === "Credenciais inválidas.", t2.text);
    check("Login inválido: nenhuma sessão criada", (await page.evaluate(() => localStorage.getItem("token"))) === null);
    await login("dono@test.com", "123456");
    const t3 = await toast("#login-form");
    check("Login: toast verde", t3.cls === "sgdi-toast--success", t3.text);
    const session = await page.evaluate(() => ({ token: localStorage.getItem("token"), user: localStorage.getItem("sgdi_user") }));
    check("Login: token salvo e usuário sem senha", session.token === "T-2" && !session.user.includes("123456") && JSON.parse(session.user).type_user === 2, session.user);
    await page.waitForFunction(() => location.pathname.endsWith("owner.html"), { timeout: 8000 });
    check("Login: redireciona o Proprietário para owner.html", true);

    // E) CRUD como Proprietário
    await goto("app/manage.html");
    check("Manage: sessão exibe o nome", (await page.$eval("#user-display-name", (e) => e.textContent)) === "Dono Teste");
    check("Manage: lista inicial de imóveis vem da API", (await rows("#property-list")).length === 1);
    await set("#property-form [name=location]", "Av. Brasil, 500"); await set("#property-form [name=numberOfRooms]", "3");
    await click('#property-form button[type="submit"]');
    const t4 = await toast(); await settle();
    check("Imóvel CREATE: toast verde com a mensagem da API", t4.cls === "sgdi-toast--success" && t4.text === "Cadastrado com sucesso!", t4.text);
    check("Imóvel CREATE: id_owner vem do token e linha aparece", db.properties.at(-1).id_owner === 2 && (await rows("#property-list")).length === 2);
    await clickRowAction("#property-list", 1, "edit");
    check("Imóvel EDIT: formulário preenchido", (await page.$eval("#property-form [name=location]", (e) => e.value)) === "Av. Brasil, 500");
    await set("#property-form [name=location]", "Av. Brasil, 501"); await click('#property-form button[type="submit"]'); await settle();
    check("Imóvel UPDATE: PUT com id_property gravou no banco", db.properties.at(-1).location === "Av. Brasil, 501");
    check("Imóvel UPDATE: tabela recarregada da API", (await rows("#property-list"))[1][1] === "Av. Brasil, 501");
    await set("#property-form [name=location]", ""); await click('#property-form button[type="submit"]');
    const t5 = await toast();
    check("Validação: campo vazio -> toast amarelo, sem requisição de escrita", t5.cls === "sgdi-toast--warning" && db.properties.length === 2, t5.text);
    await page.$eval('#property-form [data-action="cancel"]', (b) => b.click());
    await clickRowAction("#property-list", 1, "delete"); await settle();
    check("Imóvel DELETE com confirmação", db.properties.length === 1 && (await rows("#property-list")).length === 1);

    // F) Contratos + validação cruzada
    await set("#contract-form [name=idProperty]", "1"); await set("#contract-form [name=rentValue]", "1500");
    await set("#contract-form [name=startDate]", "2026-06-01"); await set("#contract-form [name=endDate]", "2026-05-01");
    await click('#contract-form button[type="submit"]');
    const t6 = await toast();
    check("Contrato: data final < inicial -> toast amarelo", t6.cls === "sgdi-toast--warning" && db.contracts.length === 0, t6.text);
    await set("#contract-form [name=endDate]", "2026-12-01"); await set("#contract-form [name=status]", "ACTIVE");
    await click('#contract-form button[type="submit"]'); await settle();
    check("Contrato CREATE: gravado (end_date enviado, id_user do token)", db.contracts.length === 1 && db.contracts[0].id_user === 2 && db.contracts[0].end_date === "2026-12-01");
    check("Contrato: valor formatado em R$", (await rows("#contract-list"))[0][2].includes("1.500,00"));
    await clickRowAction("#contract-list", 0, "edit"); await set("#contract-form [name=rentValue]", "1750");
    await click('#contract-form button[type="submit"]'); await settle();
    check("Contrato UPDATE", db.contracts[0].rent_value === "1750");

    // G) Atendimento (Proprietário só conclui) e perfil
    check("Atendimento: formulário de criação oculto para Proprietário", await page.$eval("#appointment-form", (f) => getComputedStyle(f).display === "none"));
    await clickRowAction("#appointment-list", 0, "toggle"); await settle();
    check("Atendimento UPDATE: PUT só com completed", db.appointments[0].completed === "1" && (await rows("#appointment-list"))[0][4] === "Sim");
    await set("#profile-form [name=password]", "novasenha"); await click('#profile-form button[type="submit"]');
    const t7 = await toast("#profile-section");
    check("Perfil: PUT /users/update com toast inline verde", t7.cls === "sgdi-toast--success", t7.text);
    check("Perfil: senha limpa do formulário e ausente do localStorage", (await page.$eval("#profile-form [name=password]", (e) => e.value)) === "" && !(await page.evaluate(() => JSON.stringify({ ...localStorage }))).includes("novasenha"));

    // H) Evidência de protótipos
    const proof = await page.$eval("#proto-proof", (e) => e.textContent);
    check("Protótipos: todos os testes de identidade = true", !proof.includes("false"), proof.replace(/\n/g, " | "));
    await page.evaluate(() => (document.querySelector("details.panel").open = true));
    await shot("01-manage-proprietario");

    // I) Resposta inesperada (HTML antes do JSON) e 401
    flags.garbageOn = "POST /properties/insert";
    await set("#property-form [name=location]", "Rua Lixo"); await click('#property-form button[type="submit"]');
    const t8 = await toast();
    check("Resposta inesperada: toast vermelho, sem silenciar", t8.cls === "sgdi-toast--error" && t8.text.startsWith("Resposta inesperada"), t8.text);
    check("Resposta inesperada: erro registrado no console", consoleErrors.some((e) => e.includes("Resposta inesperada")));
    flags.garbageOn = null; await page.$eval('#property-form [data-action="cancel"]', (b) => b.click());
    await page.evaluate(() => localStorage.setItem("token", "T-999"));
    await set("#property-form [name=location]", "Rua 401"); await click('#property-form button[type="submit"]');
    const t9 = await toast();
    check("401: toast vermelho com mensagem do backend e nada é gravado", t9.cls === "sgdi-toast--error" && /Token/.test(t9.text) && !db.properties.some((p) => p.location === "Rua 401"), t9.text);
    await page.evaluate(() => localStorage.setItem("token", "T-2"));
    await page.$eval("#property-form", (f) => f.querySelector("[data-action=cancel]").click());

    // J) Logout
    await click("#btn-logout");
    await page.waitForFunction(() => location.pathname.endsWith("login.html"));
    check("Logout: sessão removida e volta ao login", (await page.evaluate(() => localStorage.getItem("token"))) === null);
    await goto("app/manage.html");
    check("Guarda: sem sessão, manage.html redireciona ao login", page.url().endsWith("login.html"));

    // K) Inquilino
    await login("inq@test.com", "123456");
    await page.waitForFunction(() => location.pathname.endsWith("tenant.html"), { timeout: 8000 });
    await goto("app/manage.html");
    check("Inquilino: formulários de imóvel/contrato ocultos; atendimento visível", (await page.$eval("#property-form", (f) => getComputedStyle(f).display === "none")) && (await page.$eval("#contract-form", (f) => getComputedStyle(f).display === "none")) && !(await page.$eval("#appointment-form", (f) => getComputedStyle(f).display === "none")));
    await set("#appointment-form [name=idProperty]", "1"); await set("#appointment-form [name=date]", "2026-11-11"); await set("#appointment-form [name=observation]", "Visita do inquilino");
    await click('#appointment-form button[type="submit"]'); await settle();
    check("Atendimento CREATE (Inquilino)", db.appointments.some((a) => a.observation === "Visita do inquilino"));
    check("Inquilino não vê botão Concluir", (await page.$$('#appointment-list button[data-action="toggle"]')).length === 0);
    await shot("02-manage-inquilino");
    await clickRowAction("#appointment-list", 1, "delete"); await settle();
    check("Atendimento DELETE (Inquilino) com confirmação", !db.appointments.some((a) => a.observation === "Visita do inquilino"));

} catch (error) {
    check("Exceção no roteiro E2E", false, error.message);
} finally {
    const failed = results.filter((r) => !r.ok);
    const md = ["# Evidências automáticas (E2E)", "", `Executado com Chromium headless contra um servidor mock que imita o contrato da API (\`views/tests/e2e/mock-api.mjs\`).`, "", "| # | Verificação | Resultado |", "|---|---|---|", ...results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.ok ? "✅ passou" : "❌ falhou"} |`), "", `**${results.length - failed.length}/${results.length} verificações passaram.**`];
    fs.writeFileSync(path.join(OUT, "e2e-resultados.md"), md.join("\n") + "\n");
    console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`);
    await browser.close();
    process.exit(failed.length ? 1 : 0);
}
