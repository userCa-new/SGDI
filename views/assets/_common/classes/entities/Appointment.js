import Entity, { toBool, toNullableInt, requiredText, isoDate } from "./Entity.js";

/** Atendimento/visita agendada — tabela `appointments`. */
export default class Appointment extends Entity {
    #id = null;
    #idProperty = null;
    #date = "";
    #observation = "";
    #completed = false;

    constructor({ id = null, idProperty = null, date = "", observation = "", completed = false } = {}) {
        super();
        this.id = id;
        this.idProperty = idProperty;
        if (date) this.date = date;
        if (observation !== "") this.observation = observation;
        this.completed = completed;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = toNullableInt(value); }

    get idProperty() { return this.#idProperty; }
    set idProperty(value) {
        const id = toNullableInt(value);
        if (id !== null && (!Number.isInteger(id) || id <= 0)) throw new RangeError("O imóvel do atendimento é inválido");
        this.#idProperty = id;
    }

    get date() { return this.#date; }
    set date(value) { this.#date = isoDate(value, "A data"); }

    get observation() { return this.#observation; }
    set observation(value) { this.#observation = requiredText(value, "A observação", 200); }

    get completed() { return this.#completed; }
    set completed(value) { this.#completed = toBool(value); }

    isCompleted() { return this.#completed; }
    markCompleted() { this.#completed = true; return this; }
    reopen() { this.#completed = false; return this; }

    validate() {
        const errors = [];
        if (this.#idProperty === null) errors.push("Informe o imóvel do atendimento.");
        if (!this.#date) errors.push("A data é obrigatória.");
        if (this.#observation === "") errors.push("A observação é obrigatória.");
        return errors;
    }

    /** listAll → id_appointment / id_property; listById → id / idProperty */
    static fromApi(p = {}) {
        return new Appointment({
            id: p.id_appointment ?? p.id,
            idProperty: p.id_property ?? p.idProperty,
            date: p.date ?? "",
            observation: p.observation ?? "",
            completed: p.completed,
        });
    }

    /** corpo de POST /appointments/insert */
    toApi() {
        return { id_property: this.#idProperty, date: this.#date, observation: this.#observation, completed: this.#completed };
    }

    /** PUT /appointments/update/{id} só aceita `completed` (contrato do controller). */
    toCompletionPayload() {
        return { completed: this.#completed };
    }

    toJSON() {
        return { id: this.id, idProperty: this.idProperty, date: this.date, observation: this.observation, completed: this.completed };
    }
}
