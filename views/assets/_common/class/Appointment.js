export default class Appointment {
    #id;
    #idProperty;
    #date;
    #observation;
    #completed;

    constructor({ id = null, idProperty = null, date = null, observation = null, completed = null } = {}) {
        this.id = id;
        this.idProperty = idProperty;
        this.date = date;
        this.observation = observation;
        this.completed = this.completed;
    }

    get id() {
        return this.#id;
    }

    set id(id) {
        this.#id = id === null ? null : Number(id);
    }

    get idProperty() {
        return this.#idProperty;
    }

    set idProperty(idProperty) {
        this.#idProperty = idProperty === null ? null : Number(idProperty);
    }

    get date() {
        return this.#date;
    }

    set date(date) {
         if (typeof date !== "string" || date.trim() === "") {
            throw new TypeError("A data é obrigatória");
        }
        this.#date = date.trim();
    }

    get observation ()
    {
        return this.#observation;
    }

    set observation (observation)
    {
         if (typeof observation !== "string" || observation.trim() === "") {
            throw new TypeError("A observação é obrigatória");
        }
        this.#observation = observation.trim();

    }

    get completed ()
    {
        return this.#completed;
    }

    set completed (completed)
    {
        this.#completed = completed === null ? null : Number(completed);
    }

    toJSON() {
        return { id: this.id, idProperty: this.idProperty, date: this.date, observation: this.observation, completed: this.completed };
    }
}