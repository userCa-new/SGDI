/**
 * SessionStorage — guarda token e dados mínimos do usuário no localStorage.
 * Nunca guarda senha. O escopo padrão mantém as chaves legadas ("token" e
 * "sgdi_user") para não invalidar sessões criadas antes da refatoração.
 */
export default class SessionStorage {
    #tokenKey;
    #userKey;

    constructor(scope = "default") {
        const isDefault = scope === "default";
        this.#tokenKey = isDefault ? "token" : `sgdi_${scope}_token`;
        this.#userKey = isDefault ? "sgdi_user" : `sgdi_${scope}_user`;
    }

    saveSession(token, user = null) {
        localStorage.setItem(this.#tokenKey, token);
        if (user) {
            // remove qualquer campo sensível antes de persistir
            const { password, token: _t, ...safeUser } = user;
            localStorage.setItem(this.#userKey, JSON.stringify(safeUser));
        }
    }

    getToken() {
        return localStorage.getItem(this.#tokenKey);
    }

    getUser() {
        try {
            return JSON.parse(localStorage.getItem(this.#userKey) || "null");
        } catch {
            return null;
        }
    }

    updateUser(partial) {
        const current = this.getUser() ?? {};
        const { password, token, ...safe } = partial;
        localStorage.setItem(this.#userKey, JSON.stringify({ ...current, ...safe }));
    }

    isAuthenticated() {
        return Boolean(this.getToken());
    }

    clearSession() {
        localStorage.removeItem(this.#tokenKey);
        localStorage.removeItem(this.#userKey);
    }
}
