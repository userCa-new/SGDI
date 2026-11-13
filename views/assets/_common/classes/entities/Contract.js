import Entity, { toNullableInt, nonNegativeNumber, isoDate } from "./Entity.js";

export default class Contract extends Entity {
  static STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
    PENDING: "PENDING",
  });
  static STATUS_LABEL = Object.freeze({
    ACTIVE: "Ativo",
    CLOSED: "Encerrado",
    PENDING: "Pendente",
  });

  #id = null;
  #idProperty = null;
  #idUser = null;
  #rentValue = 0;
  #startDate = "";
  #endDate = null;
  #status = Contract.STATUS.PENDING;

  constructor({
    id = null,
    idProperty = null,
    idUser = null,
    rentValue = 0,
    startDate = "",
    endDate = null,
    status = Contract.STATUS.PENDING,
  } = {}) {
    super();
    this.id = id;
    this.idProperty = idProperty;
    this.idUser = idUser;
    this.rentValue = rentValue;
    if (startDate) this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = toNullableInt(value);
  }

  get idProperty() {
    return this.#idProperty;
  }
  set idProperty(value) {
    const id = toNullableInt(value);
    if (id !== null && (!Number.isInteger(id) || id <= 0))
      throw new RangeError("O imóvel do contrato é inválido");
    this.#idProperty = id;
  }

  get idUser() {
    return this.#idUser;
  }
  set idUser(value) {
    this.#idUser = toNullableInt(value);
  }

  get rentValue() {
    return this.#rentValue;
  }
  set rentValue(value) {
    this.#rentValue = nonNegativeNumber(value, "O valor do aluguel");
  }

  get startDate() {
    return this.#startDate;
  }
  set startDate(value) {
    this.#startDate = isoDate(value, "A data inicial");
  }

  get endDate() {
    return this.#endDate;
  }
  set endDate(value) {
    this.#endDate =
      value === null || value === undefined || value === ""
        ? null
        : isoDate(value, "A data final");
  }

  get status() {
    return this.#status;
  }
  set status(value) {
    const status = String(value ?? "").toUpperCase();
    if (!(status in Contract.STATUS))
      throw new RangeError("Status do contrato inválido");
    this.#status = status;
  }

  isActive() {
    return this.#status === Contract.STATUS.ACTIVE;
  }
  close() {
    this.#status = Contract.STATUS.CLOSED;
    return this;
  }
  durationInDays() {
    if (!this.#startDate || !this.#endDate) return null;
    return Math.round(
      (Date.parse(this.#endDate) - Date.parse(this.#startDate)) / 86400000,
    );
  }

  validate() {
    const errors = [];
    if (this.#idProperty === null) errors.push("Informe o imóvel do contrato.");
    if (!this.#startDate) errors.push("A data inicial é obrigatória.");
    if (!this.#endDate) errors.push("A data final é obrigatória.");
    else if (this.#startDate && this.#endDate < this.#startDate)
      errors.push("A data final não pode ser anterior à inicial.");
    return errors;
  }

  static fromApi(p = {}) {
    return new Contract({
      id: p.id_contract ?? p.id,
      idProperty: p.id_property,
      idUser: p.id_user,
      rentValue: p.rent_value ?? 0,
      startDate: p.start_date ?? "",
      endDate: p.end_date,
      status: p.status ?? Contract.STATUS.PENDING,
    });
  }

  toApi() {
    return {
      id_property: this.#idProperty,
      rent_value: this.#rentValue,
      start_date: this.#startDate,
      end_date: this.#endDate ?? "",
      status: this.#status,
    };
  }

  toJSON() {
    return {
      id: this.id,
      idProperty: this.idProperty,
      idUser: this.idUser,
      rentValue: this.rentValue,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
    };
  }
}
