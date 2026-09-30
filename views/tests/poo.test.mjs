// Testes sem dependências: node views/tests/poo.test.mjs
import assert from "node:assert/strict";
import Property from "../assets/_common/classes/entities/Property.js";
import Contract from "../assets/_common/classes/entities/Contract.js";
import Appointment from "../assets/_common/classes/entities/Appointment.js";
import User from "../assets/_common/classes/entities/User.js";
import Faq from "../assets/_common/classes/entities/Faq.js";
import HttpClientBase, { ApiError } from "../assets/_common/classes/HttpClientBase.js";
import PropertyService from "../assets/_common/classes/services/PropertyService.js";
import AppointmentService from "../assets/_common/classes/services/AppointmentService.js";
import UserService from "../assets/_common/classes/services/UserService.js";
import { createToast, ToastPrototype } from "../assets/_common/prototypes/Toast.js";

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok -", name); };
const silence = (fn) => { const e = console.error; console.error = () => {}; try { return fn(); } finally { console.error = e; } };

// ---------- entidades ----------
await test("Property: payload da API <-> objeto", () => {
    const p = Property.fromApi({ id_property: "7", id_owner: "3", location: " Rua A ", number_of_rooms: "2", availability: "1", late_payment: "0" });
    assert.equal(p.id, 7); assert.equal(p.location, "Rua A"); assert.equal(p.numberOfRooms, 2);
    assert.equal(p.isAvailable(), true); assert.equal(p.hasLatePayment(), false);
    assert.deepEqual(p.toApi(), { location: "Rua A", number_of_rooms: 2, availability: true, late_payment: false, id_property: 7 });
});
await test("Property: validações dos setters", () => {
    assert.throws(() => new Property({ location: "x", numberOfRooms: -1 }), RangeError);
    const p = new Property();
    assert.throws(() => (p.location = ""), TypeError);
    assert.throws(() => (p.numberOfRooms = 1.5), RangeError);
    assert.deepEqual(p.validate(), ["A localização é obrigatória."]);
});
await test("Property: encapsulamento (campo privado inacessível)", () => {
    const p = new Property({ location: "x" });
    assert.equal(p.location, "x");
    assert.equal(Object.keys(p).length, 0);
    assert.equal(Object.hasOwn(p, "location"), false);
});
await test("Contract: datas, status e regras", () => {
    const c = Contract.fromApi({ id_contract: 1, id_property: 2, id_user: 3, rent_value: "1500.50", start_date: "2026-01-01", end_date: null, status: "ACTIVE" });
    assert.equal(c.rentValue, 1500.5); assert.equal(c.isActive(), true);
    assert.ok(c.validate().includes("A data final é obrigatória."));
    c.endDate = "2025-12-31";
    assert.ok(c.validate().includes("A data final não pode ser anterior à inicial."));
    c.endDate = "2026-01-31"; assert.equal(c.durationInDays(), 30); assert.deepEqual(c.validate(), []);
    assert.throws(() => (c.status = "X"), RangeError);
    assert.throws(() => (c.startDate = "01/01/2026"), TypeError);
    assert.equal("id_user" in c.toApi(), false);
});
await test("Appointment: dois formatos de resposta e PUT só com completed", () => {
    const a = Appointment.fromApi({ id_appointment: 5, id_property: 2, date: "2026-02-02", observation: "Visita", completed: "0" });
    const b = Appointment.fromApi({ id: 5, idProperty: 2, date: "2026-02-02", observation: "Visita", completed: 1 });
    assert.equal(a.id, b.id); assert.equal(a.isCompleted(), false); assert.equal(b.isCompleted(), true);
    assert.deepEqual(a.markCompleted().toCompletionPayload(), { completed: true });
    assert.throws(() => (a.observation = "x".repeat(201)), RangeError);
});
await test("User: senha write-only e fora da sessão/JSON", () => {
    const u = new User({ name: "Ana", email: "ana@x.com", password: "segredo1", userType: 2 });
    assert.equal(u.password, undefined);
    assert.equal(JSON.stringify(u).includes("segredo1"), false);
    assert.deepEqual(u.toLoginPayload(), { email: "ana@x.com", password: "segredo1" });
    assert.equal(u.homePath(), "../app/owner.html");
    assert.throws(() => (u.password = "123"), RangeError);
    assert.throws(() => (u.email = "invalido"), TypeError);
    assert.equal(User.fromApi({ id_user: 1, name: "B", token: "t", type_user: 1 }).isTenant(), true);
});
await test("Entity.fromApiList e Faq", () => {
    assert.deepEqual(Faq.fromApiList(null), []);
    assert.equal(Faq.fromApiList([{ id_faq: 1, id_category: 2, question: "q", answer: "a" }])[0].idCategory, 2);
});

// ---------- HttpClientBase / serviços (fetch simulado) ----------
const calls = [];
const fakeFetch = (handler) => (globalThis.fetch = async (url, options) => { calls.push({ url, options }); return handler(url, options); });
const reply = (status, body) => ({ status, ok: status < 400, text: async () => (typeof body === "string" ? body : JSON.stringify(body)) });
globalThis.localStorage = { store: { token: "abc.jwt" }, getItem(k) { return this.store[k] ?? null; }, setItem() {}, removeItem() {} };

await test("HttpClientBase: Bearer, form-urlencoded e herança nos serviços", async () => {
    fakeFetch(() => reply(200, { code: 200, type: "success", status: "success", message: "ok", data: [{ id_property: 1, location: "A", number_of_rooms: 1 }] }));
    const svc = new PropertyService();
    assert.ok(svc instanceof HttpClientBase);
    const res = await svc.list();
    assert.equal(res.data[0] instanceof Property, true);
    assert.equal(calls.at(-1).options.headers.Authorization, "Bearer abc.jwt");
    assert.equal(calls.at(-1).url, "http://localhost/SGDI/api/properties/listAll");
    await svc.update(new Property({ id: 9, location: "B" }));
    const put = calls.at(-1);
    assert.equal(put.options.method, "PUT"); assert.equal(put.url.endsWith("/properties/update/9"), true);
    assert.equal(put.options.headers["Content-Type"], "application/x-www-form-urlencoded");
    assert.equal(put.options.body.get("id_property"), "9"); assert.equal(put.options.body.get("availability"), "1");
});
await test("AppointmentService.update envia só completed", async () => {
    fakeFetch(() => reply(200, { code: 200, type: "success", message: "ok" }));
    await new AppointmentService().update(new Appointment({ id: 3, idProperty: 1, date: "2026-01-01", observation: "o", completed: true }));
    assert.deepEqual([...calls.at(-1).options.body.entries()], [["completed", "1"]]);
});
await test("UserService.login usa POST /users/login e não coloca credenciais na URL", async () => {
    fakeFetch(() => reply(200, { code: 200, type: "success", message: "ok", data: { id_user: 1, name: "A", token: "t", type_user: 2 } }));
    const res = await new UserService().login(new User({ email: "a@b.co", password: "123456" }));
    assert.equal(calls.at(-1).options.method, "POST");
    assert.equal(calls.at(-1).url.includes("123456"), false);
    assert.equal(res.data.token, "t");
});
await test("erros: 4xx devolvido, não-JSON e rede lançam ApiError", async () => {
    fakeFetch(() => reply(401, { code: 401, type: "error", status: "unauthorized", message: "Token inválido", data: null }));
    const res = await new PropertyService().list();
    assert.equal(res.type, "error"); assert.equal(res.code, 401);
    fakeFetch(() => reply(200, "array(1){...}{\"code\":200}"));
    await assert.rejects(() => new PropertyService().list(), ApiError);
    fakeFetch(() => { throw new TypeError("Failed to fetch"); });
    await assert.rejects(() => new PropertyService().list(), /Serviço indisponível/);
    fakeFetch(() => reply(404, { code: 404, status: "not_found", message: "URL não encontrada" }));
    assert.equal((await new PropertyService().list()).type, "error");
});

// ---------- Toast (protótipo) ----------
const fakeDoc = () => {
    const make = (tag) => ({ tag, children: [], attrs: {}, className: "", textContent: "", appendChild(c) { this.children.push(c); c.parent = this; }, setAttribute(k, v) { this.attrs[k] = v; }, remove() { const i = this.parent?.children.indexOf(this); if (i >= 0) this.parent.children.splice(i, 1); } });
    const doc = { head: make("head"), ids: {}, getElementById(id) { return this.ids[id] ?? null; }, createElement(tag) { const el = make(tag); el.ownerDocument = doc; return el; } };
    const body = doc.createElement("body");
    return { doc, body };
};
await test("Toast.normalize: com/sem data, mensagens e resposta inesperada", () => {
    const n = (x) => silence(() => ToastPrototype.normalize(x));
    assert.deepEqual(n({ code: 200, type: "success", message: "Salvo", data: { a: 1 } }), { type: "success", message: "Salvo" });
    assert.deepEqual(n({ code: 200, type: "success", message: "Salvo" }), { type: "success", message: "Salvo" });
    assert.equal(n({ code: 200, type: "success", data: { id: 1 } }).message, "Operação realizada com sucesso.");
    assert.equal(n({ code: 400, type: "warning", message: "x" }).type, "warning");
    assert.equal(n({ code: 500, type: "error", message: "x" }).type, "error");
    assert.equal(n({ code: 404, status: "not_found", message: "x" }).type, "warning");
    assert.equal(n({ code: 200, message: { nested: 1 } }).message, "Operação realizada com sucesso.");
    for (const bad of [null, undefined, "texto", 42, [], { foo: "bar" }]) {
        const r = n(bad); assert.equal(r.type, "error"); assert.equal(r.unexpected, true);
    }
});
await test("Toast: dois objetos, um protótipo, métodos não recriados", () => {
    const { doc, body } = fakeDoc(); body.ownerDocument = doc;
    const a = createToast({ container: body, duration: 0 });
    const b = createToast({ container: body, duration: 0, inline: true });
    assert.notEqual(a, b);
    assert.equal(Object.getPrototypeOf(a), Object.getPrototypeOf(b)); assert.equal(Object.getPrototypeOf(a), ToastPrototype);
    assert.equal(a.show, b.show); assert.equal(Object.hasOwn(a, "show"), false);
    assert.equal(a.fromResponse({ code: 201, type: "success", message: "Criado", data: { id: 1 } }), true);
    assert.equal(a.current.textContent, "Criado"); assert.equal(a.current.className, "sgdi-toast sgdi-toast--success");
    silence(() => a.fromResponse({ code: 500, type: "error", message: "Falhou" }));
    assert.equal(a.current.className, "sgdi-toast sgdi-toast--error");
    assert.equal(a.region.children.length, 1);
    assert.equal(b.region, null); // estado próprio
    silence(() => a.fromError(new RangeError("valor inválido")));
    assert.equal(a.current.className, "sgdi-toast sgdi-toast--warning");
});
console.log(`\n${passed} testes passaram`);
