import HttpClientBase from "../HttpClientBase.js";
import SessionStorage from "../../scripts/storage.js";

export default class CrudService extends HttpClientBase {
  #entity;
  #resource;
  #routes;

  constructor({
    entity,
    resource,
    routes = {},
    storage = new SessionStorage(),
    ...options
  } = {}) {
    super({ tokenProvider: () => storage.getToken(), ...options });
    this.#entity = entity;
    this.#resource = resource;
    this.#routes = {
      list: "listAll",
      find: "list",
      create: "insert",
      update: "update",
      remove: "delete",
      ...routes,
    };
  }

  get entity() {
    return this.#entity;
  }

  #convert(response, convert) {
    return response.type === "success"
      ? { ...response, data: convert(response.data) }
      : response;
  }

  async list() {
    const response = await this.get(`/${this.#resource}/${this.#routes.list}`);
    return this.#convert(response, (data) => this.#entity.fromApiList(data));
  }

  async find(id) {
    const response = await this.get(
      `/${this.#resource}/${this.#routes.find}/${encodeURIComponent(id)}`,
    );
    return this.#convert(response, (data) =>
      data ? this.#entity.fromApi(data) : null,
    );
  }

  async create(entity) {
    const response = await this.post(
      `/${this.#resource}/${this.#routes.create}`,
      entity.toApi(),
    );
    return this.#convert(response, (data) =>
      data ? this.#entity.fromApi(data) : entity,
    );
  }

  async update(entity) {
    return this.put(
      `/${this.#resource}/${this.#routes.update}/${encodeURIComponent(entity.id)}`,
      this.updatePayload(entity),
    );
  }

  remove(id) {
    return this.delete(
      `/${this.#resource}/${this.#routes.remove}/${encodeURIComponent(id)}`,
    );
  }

  /** Ponto de extensão: cada serviço pode restringir o corpo do PUT ao que o controller aceita. */
  updatePayload(entity) {
    return entity.toApi();
  }
}
