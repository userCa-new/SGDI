// E2E dos painéis de proprietário e inquilino: node views/tests/e2e/run-e2e.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { start, db } from "./mock-api.mjs";

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PATH ?? "puppeteer-core");
const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost/SGDI/views/assets";
const OUT = path.resolve(new URL("../../../docs/evidencias/", import.meta.url).pathname);
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
};
const server = await start(80);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 1400 });
const consoleErrors = [];
page.on("console", (message) => message.type() === "error" && consoleErrors.push(message.text()));
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("dialog", (dialog) => dialog.accept());

const goto = (file) => page.goto(`${BASE}/${file}`, { waitUntil: "networkidle0" });
const set = (selector, value) => page.$eval(selector, (element, next) => {
  element.value = next;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}, value);
const submit = async (selector) => {
  await page.evaluate(() => document.querySelectorAll(".sgdi-toast").forEach((item) => item.remove()));
  await page.click(selector);
};
const waitToast = async (scope = "body") => {
  await page.waitForSelector(`${scope} .sgdi-toast`, { timeout: 5000 });
  return page.$eval(`${scope} .sgdi-toast`, (element) => ({
    text: element.textContent,
    className: element.className,
  }));
};
const login = async (email, password) => {
  await page.evaluate(() => localStorage.clear());
  await goto("public/login.html");
  await set("#email", email);
  await set("#senha", password);
  await submit('#login-form button[type="submit"]');
};

try {
  check("Página antiga removida", !fs.existsSync(new URL("../../assets/app/manage.html", import.meta.url)));

  await login("dono@test.com", "123456");
  await page.waitForFunction(() => location.pathname.endsWith("owner.html"));
  await page.waitForSelector("#owner-contract-form select[name=idProperty] option[value='1']");
  check("Login direciona proprietário ao painel próprio", await page.$("#owner-properties-button") !== null);
  check("Perfil integrado ao painel do proprietário", await page.$("#profile-form") !== null);

  await page.click("#owner-properties-button");
  await page.waitForSelector('#owner-gallery-property option[value="1"]');
  check("Proprietário vê somente imóveis vinculados à sua conta", (await page.$$("#owner-property-list li h3")).length === 1);
  await set("#owner-property-form [name=location]", "Avenida Central, 500");
  await set("#owner-property-form [name=numberOfRooms]", "3");
  await submit('#owner-property-form button[type="submit"]');
  let toast = await waitToast(".owner-properties-modal");
  await page.waitForFunction(() => document.querySelector("#owner-property-list").textContent.includes("Avenida Central"));
  check("Imóvel é criado pela API no painel do proprietário", toast.className.includes("sgdi-toast--success") && db.properties.some((property) => property.location === "Avenida Central, 500"));

  const createdItem = await page.$eval("#owner-property-list", (items) => items.textContent.includes("Avenida Central"));
  check("Imóvel recém-criado aparece no estado persistido da lista", createdItem);
  await page.$$eval("#owner-property-list li", (items) => {
    items.find((item) => item.querySelector("h3")?.textContent.includes("Avenida Central"))
      ?.querySelector('button[data-action="edit"]')?.click();
  });
  await set("#owner-property-form [name=location]", "Avenida Central, 501");
  await submit('#owner-property-form button[type="submit"]');
  await page.waitForFunction(() => document.querySelector("#owner-property-list").textContent.includes("Avenida Central, 501"));
  check("Edição de imóvel atualiza o registro da API", db.properties.some((property) => property.location === "Avenida Central, 501"));
  await page.$$eval("#owner-property-list li", (items) => {
    items.find((item) => item.querySelector("h3")?.textContent.includes("Avenida Central"))
      ?.querySelector('button[data-action="delete"]')?.click();
  });
  await page.waitForFunction(() => !document.querySelector("#owner-property-list").textContent.includes("Avenida Central"));
  check("Remoção de imóvel exige confirmação e remove seu registro", !db.properties.some((property) => property.location.startsWith("Avenida Central")));

  await set("#owner-contract-form [name=idProperty]", "1");
  await set("#owner-contract-form [name=idUser]", "1");
  await set("#owner-contract-form [name=rentValue]", "1500");
  await set("#owner-contract-form [name=startDate]", "2026-06-01");
  await set("#owner-contract-form [name=endDate]", "2026-05-01");
  await submit('#owner-contract-form button[type="submit"]');
  toast = await waitToast();
  check("Validação impede vigência inválida antes da requisição", toast.className.includes("sgdi-toast--warning") && db.contracts.length === 0);

  await set("#owner-contract-form [name=endDate]", "2027-05-31");
  await set("#owner-contract-form [name=status]", "ACTIVE");
  await submit('#owner-contract-form button[type="submit"]');
  await page.waitForFunction(() => document.querySelector("#owner-contract-list").textContent.includes("Inquilino Teste"));
  check("Contrato é criado para o inquilino selecionado", db.contracts.length === 1 && db.contracts[0].id_user === 1 && db.contracts[0].id_property === 1);

  await page.waitForSelector("#owner-appointment-list button");
  await page.click("#owner-appointment-list button");
  await page.waitForFunction(() => db.appointments[0].completed === "1");
  check("Proprietário conclui o atendimento e a API persiste o estado", db.appointments[0].completed === "1");
  check("Controles de imóveis não aparecem na área do inquilino", await page.$("#tenant-appointment-form") === null);

  await login("inq@test.com", "123456");
  await page.waitForFunction(() => location.pathname.endsWith("tenant.html"));
  await page.waitForSelector("#tenant-contract-list .management-card");
  await page.waitForSelector("#property-gallery .property-gallery-card");
  check("Inquilino consulta apenas seus contratos e imóveis locados", await page.$$("#tenant-contract-list .management-card").then((items) => items.length === 1) && (await page.$$("#property-gallery .property-gallery-card")).length === 1);
  check("Navegação do inquilino não expõe o módulo removido", !(await page.$eval("body", (element) => element.innerText.includes("Gestão API"))));

  await set("#tenant-appointment-form [name=idProperty]", "1");
  await set("#tenant-appointment-form [name=date]", "2026-11-11");
  await set("#tenant-appointment-form [name=observation]", "Visita técnica");
  await submit('#tenant-appointment-form button[type="submit"]');
  await page.waitForFunction(() => db.appointments.some((appointment) => appointment.observation === "Visita técnica"));
  check("Inquilino solicita atendimento ligado ao contrato ativo", db.appointments.some((appointment) => appointment.observation === "Visita técnica"));
  await page.click('#tenant-appointment-list button[data-id]');
  await page.waitForFunction(() => !db.appointments.some((appointment) => appointment.observation === "Visita técnica"));
  check("Inquilino cancela solicitação própria", !db.appointments.some((appointment) => appointment.observation === "Visita técnica"));
  check("Proprietário e inquilino sem erros de JavaScript no navegador", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

  await page.evaluate(() => localStorage.clear());
  await goto("app/owner.html");
  check("Painéis seguem protegidos contra sessão ausente", page.url().endsWith("login.html"));
} catch (error) {
  check("Exceção no roteiro E2E", false, error.message);
} finally {
  const failed = results.filter((result) => !result.ok);
  const report = [
    "# Evidências automatizadas — painéis de locação",
    "",
    "Executado com Chromium headless contra o servidor mock da API.",
    "",
    "| # | Verificação | Resultado |",
    "|---|---|---|",
    ...results.map((result, index) => `| ${index + 1} | ${result.name} | ${result.ok ? "✅ passou" : "❌ falhou"} |`),
    "",
    `**${results.length - failed.length}/${results.length} verificações passaram.**`,
  ];
  fs.writeFileSync(path.join(OUT, "e2e-resultados.md"), `${report.join("\n")}\n`);
  console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`);
  await browser.close();
  server.close?.();
  process.exit(failed.length ? 1 : 0);
}
