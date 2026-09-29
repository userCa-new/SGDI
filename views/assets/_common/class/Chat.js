export default class Chat {
    #idChat;
    #idProperty;
    #creationDate;


    constructor({ idChat = null, idProperty = null, creationDate = null } = {}) {
        this.idChat = idChat;
        this.idProperty = idProperty;
        this.creationDate = creationDate;
    }

    get idChat() {
        return this.#idChat;
    }

    set idChat(value) {
        this.#idChat = value === null ? null : Number(value);
    }
    get idProperty() {
        return this.#idProperty;
    }

    set idProperty(value) {
        this.#idProperty = value === null ? null : Number(value);
    }

    get creationDate() {
        return this.#creationDate;
    }

    set creationDate(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A data de criação é obrigatória");
        }
        this.#creationDate = value.trim();
    }

    toJSON() {
        return { idChat: this.idChat, idProperty: this.idProperty, creationDate: this.creationDate };
    }
}