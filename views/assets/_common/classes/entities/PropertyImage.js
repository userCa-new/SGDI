import Entity, { toNullableInt } from "./Entity.js";
import { IMAGE_RULES, safeUploadUrl } from "../../scripts/image-rules.js";

/** Imagem de um imóvel — tabela `property_images` (N imagens para 1 imóvel). */
export default class PropertyImage extends Entity {
  #id = null;
  #idProperty = null;
  #path = "";
  #url = null;
  #altText = "";
  #position = 0;
  #createdAt = null;

  constructor({
    id = null,
    idProperty = null,
    path = "",
    url = null,
    altText = "",
    position = 0,
    createdAt = null,
  } = {}) {
    super();
    this.id = id;
    this.idProperty = idProperty;
    this.path = path;
    this.url = url;
    this.altText = altText;
    this.position = position;
    this.createdAt = createdAt;
  }

  get id() { return this.#id; }
  set id(value) { this.#id = toNullableInt(value); }

  get idProperty() { return this.#idProperty; }
  set idProperty(value) { this.#idProperty = toNullableInt(value); }

  /** caminho relativo (nunca absoluto do servidor), ex.: uploads/properties/<hash>.jpg */
  get path() { return this.#path; }
  set path(value) { this.#path = typeof value === "string" ? value : ""; }

  /** URL pública já verificada (mesma origem da API) ou null */
  get url() { return this.#url; }
  set url(value) { this.#url = typeof value === "string" ? value : null; }

  get altText() { return this.#altText; }
  set altText(value) {
    const text = value === null || value === undefined ? "" : String(value).trim();
    if (text.length > IMAGE_RULES.maxAltLength) {
      throw new RangeError(`O texto alternativo deve ter no máximo ${IMAGE_RULES.maxAltLength} caracteres`);
    }
    this.#altText = text;
  }

  get position() { return this.#position; }
  set position(value) {
    const number = Number(value);
    this.#position = Number.isInteger(number) && number >= 0 ? number : 0;
  }

  get createdAt() { return this.#createdAt; }
  set createdAt(value) { this.#createdAt = value ? String(value) : null; }

  /** Texto alternativo acessível: o informado ou um padrão. */
  describe() {
    return this.#altText || `Imagem ${this.#position + 1} do imóvel #${this.#idProperty}`;
  }

  /** payload da API → entidade; a URL só é aceita se pertencer à própria API. */
  static fromApi(p = {}, baseUrl = null) {
    const url = safeUploadUrl(p.url, baseUrl);
    if (p.url && !url) console.warn("[PropertyImage] URL de imagem ignorada (fora da API):", p.url);
    return new PropertyImage({
      id: p.id_image ?? p.id,
      idProperty: p.id_property,
      path: p.path ?? p.image_path ?? "",
      url,
      altText: p.alt_text ?? "",
      position: p.position ?? 0,
      createdAt: p.created_at,
    });
  }

  toApi() {
    return { alt_text: this.#altText };
  }

  toJSON() {
    return {
      id: this.id,
      idProperty: this.idProperty,
      path: this.path,
      url: this.url,
      altText: this.altText,
      position: this.position,
      createdAt: this.createdAt,
    };
  }
}
