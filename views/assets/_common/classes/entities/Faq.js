import Entity, { toBool, toNullableInt, requiredText } from "./Entity.js";

/** Pergunta frequente — tabela `faqs` (somente leitura na área pública). */
export default class Faq extends Entity {
    #id = null;
    #idCategory = null;
    #question = "";
    #answer = "";
    #active = true;

    constructor({ id = null, idCategory = null, question = "", answer = "", active = true } = {}) {
        super();
        this.id = id;
        this.idCategory = idCategory;
        if (question !== "") this.question = question;
        if (answer !== "") this.answer = answer;
        this.active = active;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = toNullableInt(value); }
    get idCategory() { return this.#idCategory; }
    set idCategory(value) { this.#idCategory = toNullableInt(value); }
    get question() { return this.#question; }
    set question(value) { this.#question = requiredText(value, "A pergunta", 255); }
    get answer() { return this.#answer; }
    set answer(value) { this.#answer = requiredText(value, "A resposta", 255); }
    get active() { return this.#active; }
    set active(value) { this.#active = toBool(value); }

    static fromApi(p = {}) {
        return new Faq({ id: p.id_faq, idCategory: p.id_category, question: p.question ?? "", answer: p.answer ?? "", active: p.active ?? true });
    }

    toApi() {
        return { id_category: this.#idCategory, question: this.#question, answer: this.#answer };
    }

    toJSON() {
        return { id: this.id, idCategory: this.idCategory, question: this.question, answer: this.answer, active: this.active };
    }
}
