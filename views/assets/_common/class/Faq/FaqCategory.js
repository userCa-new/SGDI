export default class FaqCategory {
    #idCategory;
    #name;
    #active;


    constructor({ idCategory = null, name = null, active = null } = {}) {
        this.idCategory = idCategory;
        this.name = name;
        this.active = active;
    }

    get idCategory() {
        return this.#idCategory;
    }

    set idCategory(value) {
        this.#idCategory = value === null ? null : Number(value);
    
        this.creationDate = creationDate;

    }

   
    

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome da categoria é obrigatório");
        }
        this.#name = value.trim();
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O status da categoria é obrigatório");
        }
        this.#active = value.trim();
    }

    toJSON() {
        return { idCategory: this.idCategory, name: this.name, active: this.active };
    }
}