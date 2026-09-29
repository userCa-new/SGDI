export default class Message {
    #idMessage;
    #idChat;
    #idSender;
    #message;
    #dateTime;

    constructor({ idMessage = null, idChat = null, idSender = null, message = null, dateTime = null} = {}) {
        this.idMessage = idMessage;
        this.idChat = idChat;
        this.idSender = idSender;
        this.message = message;
        this.dateTime = dateTime;
    }
    get idMessage() {
        return this.#idMessage;
    }

    set idMessage(idMessage) {
        this.#idMessage = idMessage === null ? null : Number(this.idMessage);
    }
    
    get idChat() {
        return this.#idChat;
    }

    set idChat(idChat) {
        this.#idChat = idChat === null ? null : Number(idChat);
    }

    get idSender() {
        return this.#idSender;
    }

    set idSender(idSender) {
        this.#idSender = idSender === null ? null : Number(idSender);
    }

    get message() {
        return this.#message;
    }

    set message(message) {
        if (typeof message !== "string" || message.trim() === "") {
            throw new TypeError("A mensagem é obrigatória");
        }
        this.#message = message.trim();
    }
 
    
    get dateTime() {
        return this.#dateTime;
    }

    set dateTime(dateTime) {
        if (typeof dateTime !== "string" || dateTime.trim() === "") {
            throw new TypeError("A data é obrigatória");
        }
        this.#dateTime = dateTime.trim();
    }

    toJSON() {
        return { idMessage: this.idMessage, idChat: this.idChat, idSender: this.#idSender, 
            message: this.message, dateTime: this.dateTime
         };
    }
}