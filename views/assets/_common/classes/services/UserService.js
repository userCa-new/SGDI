import HttpClientBase from "../HttpClientBase.js";
import SessionStorage from "../../scripts/storage.js";
import User from "../entities/User.js";

/**
 * /api/users — cadastro, login e atualização de perfil.
 * O login é POST /users/login (não GET): credenciais nunca vão na URL.
 */
export default class UserService extends HttpClientBase {
    constructor({ storage = new SessionStorage(), ...options } = {}) {
        super({ tokenProvider: () => storage.getToken(), ...options });
    }

    #toUser(response) {
        return response.type === "success" && response.data ? { ...response, data: User.fromApi(response.data) } : response;
    }

    async register(user) {
        return this.#toUser(await this.post("/users/register", user.toRegisterPayload()));
    }

    async login(user) {
        return this.#toUser(await this.post("/users/login", user.toLoginPayload()));
    }

    /** PUT /users/update — exige token de Inquilino ou Proprietário. */
    async updateProfile(user) {
        return this.#toUser(await this.put("/users/update", user.toProfilePayload()));
    }
}
