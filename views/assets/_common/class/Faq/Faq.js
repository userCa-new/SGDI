export default class Faq {
    #idFaq;
    #idCategory;
    #question;
    #answer;
    #active;



    constructor({ idFaq = null, idCategory = null, question = null, answer = null, active = null } = {}) {
        this.idFaq = idFaq;
        this.idCategory = idCategory;
        this.question = question;
        this.answer = answer;
        this.active = active;
    }

    get idFaq() {
        return this.#idFaq;
    }

    set idFaq(value) {
        this.#idFaq = value === null ? null : Number(value);
    }

    get idCategory() {
        return this.#idCategory;
    }

    set idCategory(value) {
        this.#idCategory = value === null ? null : Number(value);
    }

    get question() {
        return this.#question;
    }

    set question(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A questão é obrigatória");
        }
        this.#question = value.trim();
    }
    get answer() {
        return this.#answer;
    }

    set answer(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A resposta é obrigatória");
        }
        this.#answer = value.trim();
    }
    get active() {
        return this.#active;
    }

    set active(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O status é obrigatório");
        }
        this.#active = value.trim();
    }

    toJSON() {
        return { idFaq: this.idFaq, idCategory: this.idCategory, question: this.question, answer: this.answer, active: this.active };
    }
}