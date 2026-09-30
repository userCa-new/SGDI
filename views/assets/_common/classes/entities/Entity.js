/**
 * Entity — classe base (herança) das entidades do frontend.
 * Concentra o que é comum: conversão de listas da API e validadores de setter.
 * Cada subclasse implementa fromApi (payload → objeto), toApi (objeto → payload)
 * e validate() (regras de formulário que envolvem mais de um campo).
 */
export default class Entity {
    static fromApi() {
        throw new Error(`${this.name} deve implementar fromApi()`);
    }

    /** Converte a lista `data` da API em entidades; qualquer outra coisa vira lista vazia. */
    static fromApiList(list) {
        return Array.isArray(list) ? list.map((item) => this.fromApi(item)) : [];
    }

    get isNew() {
        return this.id === null;
    }

    /** @returns {string[]} mensagens de validação (vazio = válido) */
    validate() {
        return [];
    }

    toApi() {
        throw new Error(`${this.constructor.name} deve implementar toApi()`);
    }
}

export const toBool = (value) => value === true || value === 1 || value === "1" || value === "true";

export const toNullableInt = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

export function requiredText(value, label, maxLength = Infinity) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new TypeError(`${label} é obrigatório(a)`);
    }
    const text = value.trim();
    if (text.length > maxLength) {
        throw new RangeError(`${label} deve ter no máximo ${maxLength} caracteres`);
    }
    return text;
}

export function nonNegativeNumber(value, label) {
    const number = Number(value);
    if (value === "" || value === null || !Number.isFinite(number) || number < 0) {
        throw new RangeError(`${label} deve ser um número não negativo`);
    }
    return number;
}

export function isoDate(value, label) {
    const text = typeof value === "string" ? value.trim().slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
        throw new TypeError(`${label} deve estar no formato AAAA-MM-DD`);
    }
    return text;
}
