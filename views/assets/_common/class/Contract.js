export default class Contract {
    #id;
    #idProperty;
    #idUser;
    #rentValue;
    #startDate;
    #endDate;
    #status;

    constructor({ id = null, idProperty = null, idUser = null, rentValue = null, startDate = null, endDate = null, status = null} = {}) {
        this.id = id;
        this.idProperty = idProperty;
        this.idUser = idUser;
        this.rentValue = rentValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
    get id() {
        return this.#id;
    }

    set id(id) {
        this.#id = id === null ? null : Number(this.id);
    }
    
    get idProperty() {
        return this.#idProperty;
    }

    set idProperty(idProperty) {
        this.#idProperty = idProperty === null ? null : Number(idProperty);
    }

    get idUser() {
        return this.#idUser;
    }

    set idUser(idUser) {
        this.#idUser = idUser === null ? null : Number(idUser);
    }

    get rentValue() {
        return this.#rentValue;
    }

    set rentValue(rentValue) {
        this.#rentValue = rentValue === null ? null : Number(rentValue);
    }
 
    
    get startDate() {
        return this.#startDate;
    }

    set startDate(startDate) {
        if (typeof startDate !== "string" || startDate.trim() === "") {
            throw new TypeError("A data inicial é obrigatória");
        }
        this.#startDate = startDate.trim();
    }

    
    get endDate() {
        return this.#endDate;
    }

    set endDate(endDate) {
        if (typeof endDate !== "string" || endDate.trim() === "") {
            throw new TypeError("A data final é obrigatória");
        }
        this.#endDate = endDate.trim();
    }

    get status() {
        return this.#status;
    }

    set status(status) {
        if (typeof status !== "string" || status.trim() === "") {
            throw new TypeError("O status é obrigatório");
        }
        this.#status = status.trim();
    }

    toJSON() {
        return { id: this.id, idProperty: this.idProperty, idUser: this.#idUser, 
            rentValue: this.rentValue, startDate: this.startDate, endDate: this.endDate, status: this.status
         };
    }
}