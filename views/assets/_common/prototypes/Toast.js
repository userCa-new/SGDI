/**
 * Toast — componente de mensagens da API, construído com Object.create (POO prototípica).
 *
 * COMPARTILHADO no protótipo (ToastPrototype): normalize, show, fromResponse,
 * fromError e clear — existem uma única vez na memória.
 * PRÓPRIO de cada objeto: container, duration, inline, region, current e timer.
 *
 * Aparência: success = verde · warning = amarelo · error = vermelho.
 * Nunca exibe `data` como mensagem e não engole respostas inesperadas.
 */
const TYPES = ["success", "warning", "error"];
const STYLE_ID = "sgdi-toast-styles";

const DEFAULT_MESSAGES = Object.freeze({
    success: "Operação realizada com sucesso.",
    warning: "Verifique os dados informados.",
    error: "Não foi possível concluir a operação.",
});

const CSS = `
.sgdi-toast-region{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;max-width:min(24rem,calc(100vw - 2rem))}
.sgdi-toast-region--inline{position:static;max-width:none;margin:.5rem 0}
.sgdi-toast{padding:.75rem 1rem;border-radius:.5rem;font:600 .9rem/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);border-left:.4rem solid rgba(0,0,0,.35)}
.sgdi-toast--success{background:#1e8449;color:#fff}
.sgdi-toast--warning{background:#f4d03f;color:#3b2f00}
.sgdi-toast--error{background:#c0392b;color:#fff}`;

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function ensureStyles(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    doc.head.appendChild(style);
}

function ensureRegion(toast) {
    if (toast.region) return toast.region;
    const doc = toast.container.ownerDocument;
    ensureStyles(doc);
    const region = doc.createElement("div");
    region.className = `sgdi-toast-region${toast.inline ? " sgdi-toast-region--inline" : ""}`;
    region.setAttribute("aria-live", "polite");
    toast.container.appendChild(region);
    toast.region = region;
    return region;
}

export const ToastPrototype = {
    TYPES,

    /**
     * Converte QUALQUER entrada em { type, message }. Função pura (sem DOM).
     * Aceita envelope com ou sem `data`, Error/ApiError ou resposta inesperada.
     */
    normalize(input) {
        if (input instanceof Error) {
            return { type: "error", message: input.message || DEFAULT_MESSAGES.error };
        }

        const looksLikeEnvelope = isPlainObject(input) && ["code", "type", "status", "message"].some((key) => key in input);
        if (!looksLikeEnvelope) {
            console.error("[Toast] resposta inesperada da API:", input);
            return { type: "error", message: "Resposta inesperada do servidor.", unexpected: true };
        }

        const code = Number(input.code);
        let type = TYPES.includes(input.type) ? input.type : null;
        if (!type && Number.isFinite(code)) {
            type = code >= 200 && code < 300 ? "success" : code >= 400 && code < 500 ? "warning" : "error";
        }
        if (!type) type = input.status === "success" ? "success" : "error";

        // só strings viram mensagem: `data` (objeto/array) jamais é impresso
        const message = typeof input.message === "string" && input.message.trim() !== "" ? input.message.trim() : DEFAULT_MESSAGES[type];
        return { type, message };
    },

    show(message, type = "success") {
        if (!TYPES.includes(type)) type = "error";
        const region = ensureRegion(this);

        const element = this.container.ownerDocument.createElement("div");
        element.className = `sgdi-toast sgdi-toast--${type}`;
        element.setAttribute("role", type === "error" ? "alert" : "status");
        element.textContent = String(message); // textContent: sem injeção de HTML

        this.clear();
        region.appendChild(element);
        this.current = element;
        if (this.duration > 0) {
            this.timer = setTimeout(() => this.clear(), this.duration);
        }
        return element;
    },

    /** @returns {boolean} true quando a resposta foi de sucesso */
    fromResponse(response) {
        const { type, message } = this.normalize(response);
        this.show(message, type);
        return type === "success";
    },

    /** Exibe (e registra no console) falhas de rede, validação ou resposta inesperada. */
    fromError(error) {
        console.error(`[Toast] ${error?.message ?? error}`, error);
        const { type, message } = this.normalize(error);
        // erros de validação do cliente (TypeError/RangeError das entidades) são avisos, não falhas
        const level = error instanceof TypeError || error instanceof RangeError ? "warning" : type;
        this.show(message, level);
        return false;
    },

    clear() {
        clearTimeout(this.timer);
        this.timer = null;
        this.current?.remove();
        this.current = null;
    },
};

/**
 * Fábrica: cada chamada cria um objeto novo cujo protótipo é ToastPrototype.
 * Só o estado individual é criado por objeto.
 */
export function createToast({ container = document.body, duration = 6000, inline = false } = {}) {
    return Object.create(ToastPrototype, {
        container: { value: container, writable: true },
        duration: { value: duration, writable: true },
        inline: { value: inline },
        region: { value: null, writable: true },
        current: { value: null, writable: true },
        timer: { value: null, writable: true },
    });
}
