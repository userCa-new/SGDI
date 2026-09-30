/**
 * HttpClientBase — cliente HTTP reutilizável (classe base dos serviços).
 *
 * Responsabilidades: URL base, cabeçalhos, autenticação Bearer, codificação do
 * corpo e normalização da resposta no envelope da API:
 *   { code, type, status, message, data }
 *
 * O backend (CoffeeCode Router) só lê corpos POST/PUT/DELETE em
 * application/x-www-form-urlencoded; por isso o corpo NÃO é enviado como JSON.
 *
 * Respostas 4xx/5xx com envelope válido são DEVOLVIDAS (type "error") para que
 * a tela decida como exibir. Falha de rede ou resposta que não é JSON lança
 * ApiError — nunca é silenciada.
 */
export class ApiError extends Error {
    constructor(message, { status = 0, raw = null, cause = null } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = "ApiError";
        this.status = status;
        this.raw = raw;
    }
}

export default class HttpClientBase {
    static DEFAULT_BASE_URL = "http://localhost/SGDI/api";

    #baseUrl;
    #headers;
    #token = null;
    #tokenProvider;

    /**
     * @param {object} [options]
     * @param {string} [options.baseUrl]
     * @param {object} [options.headers] cabeçalhos extras
     * @param {() => (string|null)} [options.tokenProvider] lê o token no momento de cada requisição
     */
    constructor({ baseUrl = HttpClientBase.DEFAULT_BASE_URL, headers = {}, tokenProvider = null } = {}) {
        this.#baseUrl = String(baseUrl).replace(/\/+$/, "");
        this.#headers = { Accept: "application/json", ...headers };
        this.#tokenProvider = tokenProvider;
    }

    get baseUrl() {
        return this.#baseUrl;
    }

    setAuthToken(token) {
        this.#token = token || null;
    }

    /** Cabeçalhos da requisição; Authorization só existe quando há token. */
    get headers() {
        const token = this.#token ?? this.#tokenProvider?.() ?? null;
        const headers = { ...this.#headers };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }

    async request(method, path, body = null) {
        const options = { method, headers: this.headers };

        if (body && method !== "GET") {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
            options.body = this.encodeBody(body);
        }

        let response;
        try {
            response = await fetch(`${this.#baseUrl}${path}`, options);
        } catch (error) {
            throw new ApiError("Serviço indisponível. Verifique se a API está rodando.", { cause: error });
        }

        const raw = await response.text();
        let payload;
        try {
            payload = JSON.parse(raw);
        } catch {
            throw new ApiError(`Resposta inesperada do servidor (HTTP ${response.status}).`, {
                status: response.status,
                raw,
            });
        }

        return this.normalize(payload, response.status);
    }

    /** Garante o envelope completo mesmo quando a rota devolve só parte dele (ex.: 404 do router). */
    normalize(payload, httpStatus) {
        if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
            throw new ApiError(`Resposta inesperada do servidor (HTTP ${httpStatus}).`, {
                status: httpStatus,
                raw: payload,
            });
        }
        const code = Number.isInteger(payload.code) ? payload.code : httpStatus;
        return {
            code,
            type: payload.type ?? (code >= 200 && code < 300 ? "success" : "error"),
            status: payload.status ?? null,
            message: typeof payload.message === "string" ? payload.message : null,
            data: payload.data ?? null,
        };
    }

    encodeBody(data) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) continue;
            params.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
        }
        return params;
    }

    get(path) {
        return this.request("GET", path);
    }

    post(path, body) {
        return this.request("POST", path, body);
    }

    put(path, body) {
        return this.request("PUT", path, body);
    }

    delete(path) {
        return this.request("DELETE", path);
    }
}
