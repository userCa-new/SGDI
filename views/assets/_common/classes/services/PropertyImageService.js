import HttpClientBase from "../HttpClientBase.js";
import SessionStorage from "../../scripts/storage.js";
import PropertyImage from "../entities/PropertyImage.js";

/**
 * /api/properties/{id}/images — galeria do imóvel (1:N).
 *   list    GET    /properties/{id}/images
 *   upload  POST   /properties/{id}/images        multipart: images[] + alt_text[]
 *   remove  DELETE /properties/{id}/images/{image_id}
 * Não manipula HTML. O upload envia FormData (nunca Base64 nem JSON).
 */
export default class PropertyImageService extends HttpClientBase {
  constructor({ storage = new SessionStorage(), ...options } = {}) {
    super({ tokenProvider: () => storage.getToken(), ...options });
  }

  #convert(response) {
    if (response.type !== "success" || !response.data) return response;
    const images = Array.isArray(response.data.images) ? response.data.images : [];
    return {
      ...response,
      data: {
        idProperty: Number(response.data.id_property),
        total: Number(response.data.total ?? images.length),
        images: images.map((item) => PropertyImage.fromApi(item, this.baseUrl)),
      },
    };
  }

  async list(propertyId) {
    return this.#convert(await this.get(`/properties/${encodeURIComponent(propertyId)}/images`));
  }

  /**
   * @param {number} propertyId
   * @param {File[]} files
   * @param {string[]} altTexts textos alternativos, alinhados por índice aos arquivos
   */
  async upload(propertyId, files, altTexts = []) {
    const form = new FormData();
    files.forEach((file, index) => {
      form.append("images[]", file);
      form.append("alt_text[]", altTexts[index] ?? "");
    });
    return this.#convert(
      await this.postForm(`/properties/${encodeURIComponent(propertyId)}/images`, form),
    );
  }

  remove(propertyId, imageId) {
    return this.delete(
      `/properties/${encodeURIComponent(propertyId)}/images/${encodeURIComponent(imageId)}`,
    );
  }
}
