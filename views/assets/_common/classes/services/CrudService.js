import HttpClientBase from "../HttpClientBase.js";
import SessionStorage from "../../scripts/storage.js";

/**
 * CrudService — herda HttpClientBase e implementa as cinco operações comuns
 * (list, find, create, update, remove) usando o padrão de rotas do backend:
 *   GET /{base}/listAll · GET /{base}/list/{id} · POST /{base}/insert
 *   PUT /{base}/update/{id} · DELETE /{base}/delete/{id}
 * Não conhece HTML: devolve o envelope da API com `data` convertido em entidades.
 */
export default class CrudService extends HttpClientBase {
    #entity;
    #resource;
    #routes;

    constructor({ entity, resource, routes = {}, storage = new SessionStorage(), ...options } = {}) {
        super({ tokenProvider: () => storage.getToken(), ...options });
        this.#entity = entity;
        this.#resource = resource;
        this.#routes = { list: "listAll", find: "list", create: "insert", update: "update", remove: "delete", ...routes };
    }

    get entity() {
        return this.#entity;
    }

    /** Aplica `convert` a `data` apenas quando a API respondeu com sucesso. */
    #convert(response, convert) {
        return response.type === "success" ? { ...response, data: convert(response.data) } : response;
    }

    async list() {
        const response = await this.get(`/${this.#resource}/${this.#routes.list}`);
        return this.#convert(response, (data) => this.#entity.fromApiList(data));
    }

    async find(id) {
        const response = await this.get(`/${this.#resource}/${this.#routes.find}/${encodeURIComponent(id)}`);
        return this.#convert(response, (data) => (data ? this.#entity.fromApi(data) : null));
    }

    async create(entity) {
        const response = await this.post(`/${this.#resource}/${this.#routes.create}`, entity.toApi());
        return this.#convert(response, (data) => (data ? this.#entity.fromApi(data) : entity));
    }

    async update(entity) {
        return this.put(`/${this.#resource}/${this.#routes.update}/${encodeURIComponent(entity.id)}`, this.updatePayload(entity));
    }

    remove(id) {
        return this.delete(`/${this.#resource}/${this.#routes.remove}/${encodeURIComponent(id)}`);
    }

    /** Ponto de extensão: cada serviço pode restringir o corpo do PUT ao que o controller aceita. */
    updatePayload(entity) {
        return entity.toApi();
    }
}
