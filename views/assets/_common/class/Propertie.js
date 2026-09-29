export default class Propertie {
    #idProperty;
    #idUser;
    #location;
    #numberOfRooms;
    #availability;
    #latePayment;

    constructor({ idProperty = null, idUser = null, location = null, numberOfRooms = 0, availability = null, latePayment = null } = {}) {
        this.idProperty = idProperty;
        this.idUser = idUser;
        this.location = location;
        this.numberOfRooms = numberOfRooms;
        this.availability = availability;
        this.latePayment = latePayment;
    }
    get idProperty() {
        return this.#idProperty;
    }

    set idProperty(value) {
        this.#idProperty = value === null ? null : Number(value);
    }
    
    get idUser() {
        return this.#idUser;
    }

    set idUser(value) {
        this.#idUser = value === null ? null : Number(value);
    }

    get numberOfRooms() {
        return this.#numberOfRooms;
    }

    set numberOfRooms(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O número de quartos é obrigatório");
        }
        this.#numberOfRooms = value.trim();
    }

    get availability() {
        return this.#availability;
    }

    set availability(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A disponibilidade é obrigatória");
        }
        this.#availability = value.trim();
    }
     get latePayment() {
        return this.#latePayment;
    }

    set latePayment(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O pagamento em atraso é obrigatório");
        }
        this.#latePayment = value.trim();
    }
    get location() {
        return this.#location;
    }

    set location(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A localização é obrigatória");
        }
        this.#location = value.trim();
    }

    toJSON() {
        return { idProperty: this.idProperty, idUser: this.idUser, 
            location: this.location, numberOfRooms: this.numberOfRooms, 
            availability: this.availability, latePayment: this.latePayment };
    }
}
