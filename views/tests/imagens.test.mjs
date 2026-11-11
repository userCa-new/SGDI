// Testes unitários da Etapa 07 (sem dependências): node views/tests/imagens.test.mjs
import assert from "node:assert/strict";
import { IMAGE_RULES, validateImageFile, validateImageFileDeep, sniffImageType, safeUploadUrl } from "../assets/_common/scripts/image-rules.js";
import PropertyImage from "../assets/_common/classes/entities/PropertyImage.js";
import HttpClientBase from "../assets/_common/classes/HttpClientBase.js";
import PropertyImageService from "../assets/_common/classes/services/PropertyImageService.js";
import UserService from "../assets/_common/classes/services/UserService.js";

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok -", name); };
const API = "http://localhost/SGDI/api";
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
const JPG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 16]);
const file = (bytes, name, type) => new File([bytes], name, { type });

globalThis.localStorage = { getItem: (k) => (k === "token" ? "abc.jwt" : null), setItem() {}, removeItem() {} };
const calls = [];
const fakeFetch = (body) => (globalThis.fetch = async (url, options) => { calls.push({ url, options }); return { status: 200, text: async () => JSON.stringify(body) }; });

await test("regras: tipo, extensão, tamanho e arquivo vazio", () => {
    assert.equal(validateImageFile(file(PNG, "a.png", "image/png")), null);
    assert.equal(validateImageFile(file(JPG, "a.JPG", "image/jpeg")), null);
    assert.match(validateImageFile(file(PNG, "a.gif", "image/gif")), /não é JPG, PNG ou WebP/);
    assert.match(validateImageFile(file(PNG, "a.png", "application/pdf")), /não é JPG, PNG ou WebP/);
    assert.match(validateImageFile(file(new Uint8Array(0), "a.png", "image/png")), /vazio/);
    assert.match(validateImageFile(file(new Uint8Array(IMAGE_RULES.maxBytes + 1), "g.png", "image/png")), /excede 5 MB/);
    assert.equal(validateImageFile(null), "Arquivo inválido.");
});
await test("assinatura (magic bytes) pega arquivo renomeado", async () => {
    assert.equal(sniffImageType(PNG), "image/png");
    assert.equal(sniffImageType(JPG), "image/jpeg");
    assert.equal(sniffImageType(Uint8Array.from([..."RIFF....WEBP"].map((c) => c.charCodeAt(0)))), "image/webp");
    assert.equal(await validateImageFileDeep(file(PNG, "ok.png", "image/png")), null);
    assert.match(await validateImageFileDeep(file(new TextEncoder().encode("olá, não sou imagem"), "fake.png", "image/png")), /não tem conteúdo de imagem/);
    assert.match(await validateImageFileDeep(file(new TextEncoder().encode("GIF89a......"), "gif.jpg", "image/jpeg")), /não tem conteúdo de imagem/);
});
await test("safeUploadUrl só aceita a própria API (/uploads/)", () => {
    assert.equal(safeUploadUrl(`${API}/uploads/properties/${"a".repeat(32)}.jpg`, API), `${API}/uploads/properties/${"a".repeat(32)}.jpg`);
    for (const bad of ["http://evil.example/uploads/x.jpg", `${API}/outra/x.jpg`, `${API}/uploads/../../etc/passwd`, "javascript:alert(1)", "data:image/png;base64,AAAA", "//evil.example/x.png", "", null, 42, "uploads/x.jpg"]) {
        assert.equal(safeUploadUrl(bad, API), null, String(bad));
    }
});
await test("PropertyImage: payload da API, URL verificada e texto alternativo", () => {
    const good = PropertyImage.fromApi({ id_image: "4", id_property: "1", path: "uploads/properties/x.png", url: `${API}/uploads/properties/x.png`, alt_text: " Sala ", position: "2", created_at: "2026-01-01 10:00:00" }, API);
    assert.equal(good.id, 4); assert.equal(good.idProperty, 1); assert.equal(good.altText, "Sala"); assert.equal(good.position, 2);
    assert.equal(good.url, `${API}/uploads/properties/x.png`);
    const silent = console.warn; console.warn = () => {};
    const bad = PropertyImage.fromApi({ id_image: 5, id_property: 1, url: "http://evil.example/a.png", alt_text: null }, API);
    console.warn = silent;
    assert.equal(bad.url, null);
    assert.equal(bad.describe(), "Imagem 1 do imóvel #1");
    assert.throws(() => (good.altText = "x".repeat(256)), RangeError);
    assert.equal(Object.keys(good).length, 0); // campos privados
});
await test("HttpClientBase.postForm envia FormData SEM Content-Type manual e com Bearer", async () => {
    fakeFetch({ code: 200, type: "success", message: "ok" });
    const form = new FormData(); form.append("photo", file(PNG, "a.png", "image/png"));
    await new HttpClientBase({ tokenProvider: () => "abc.jwt" }).postForm("/users/photo", form);
    const { options } = calls.at(-1);
    assert.ok(options.body instanceof FormData);
    assert.equal(options.headers["Content-Type"], undefined);
    assert.equal(options.headers.Authorization, "Bearer abc.jwt");
    assert.throws(() => new HttpClientBase().postForm("/x", { a: 1 }), TypeError);
});
await test("PropertyImageService.upload: images[] + alt_text[], rota do imóvel, entidades na resposta", async () => {
    fakeFetch({ code: 201, type: "success", message: "2 imagens enviadas com sucesso.", data: { id_property: 7, total: 1, images: [{ id_image: 1, id_property: 7, path: "uploads/properties/x.png", url: `${API}/uploads/properties/x.png`, alt_text: "Sala", position: 0 }] } });
    const service = new PropertyImageService();
    assert.ok(service instanceof HttpClientBase);
    const res = await service.upload(7, [file(PNG, "a.png", "image/png"), file(JPG, "b.jpg", "image/jpeg")], ["Sala"]);
    const { url, options } = calls.at(-1);
    assert.equal(url, `${API}/properties/7/images`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], undefined);
    assert.deepEqual([...options.body.keys()], ["images[]", "alt_text[]", "images[]", "alt_text[]"]);
    assert.deepEqual(options.body.getAll("alt_text[]"), ["Sala", ""]);
    assert.equal(options.body.getAll("images[]")[1].name, "b.jpg");
    assert.equal(res.data.images[0] instanceof PropertyImage, true);
});
await test("PropertyImageService: list e remove usam o par imóvel/imagem", async () => {
    fakeFetch({ code: 200, type: "success", message: "Galeria do imóvel", data: { id_property: 3, total: 0, images: [] } });
    const service = new PropertyImageService();
    const res = await service.list(3);
    assert.equal(calls.at(-1).url, `${API}/properties/3/images`); assert.deepEqual(res.data.images, []);
    await service.remove(3, 9);
    assert.equal(calls.at(-1).options.method, "DELETE"); assert.equal(calls.at(-1).url, `${API}/properties/3/images/9`);
});
await test("UserService.uploadPhoto: só o campo photo (nunca id de usuário); me() valida a URL", async () => {
    fakeFetch({ code: 200, type: "success", message: "Foto atualizada com sucesso.", data: { photo: `${API}/uploads/users/${"b".repeat(32)}.png` } });
    const service = new UserService();
    const res = await service.uploadPhoto(file(PNG, "eu.png", "image/png"));
    const { url, options } = calls.at(-1);
    assert.equal(url, `${API}/users/photo`); assert.deepEqual([...options.body.keys()], ["photo"]);
    assert.equal(res.data.photo.endsWith(".png"), true);
    fakeFetch({ code: 200, type: "success", message: "ok", data: { id_user: 1, name: "Ana", email: "a@b.co", type_user: 2, photo: "http://evil.example/p.png" } });
    const silent = console.warn; console.warn = () => {};
    const me = await service.me(); console.warn = silent;
    assert.equal(me.data.photo, null); assert.equal(me.data.name, "Ana");
});
console.log(`\n${passed} testes passaram`);
