import Entity, {
  toBool,
  toNullableInt,
  requiredText,
  nonNegativeNumber,
} from "./Entity.js";

export default class Property extends Entity {
  #id = null;
  #idOwner = null;
  #location = "";
  #numberOfRooms = 0;
  #availability = true;
  #latePayment = false;

  constructor({
    id = null,
    idOwner = null,
    location = "",
    numberOfRooms = 0,
    availability = true,
    latePayment = false,
  } = {}) {
    super();
    this.id = id;
    this.idOwner = idOwner;
    if (location !== "") this.location = location;
    this.numberOfRooms = numberOfRooms;
    this.availability = availability;
    this.latePayment = latePayment;
  }

  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = toNullableInt(value);
  }

  get idOwner() {
    return this.#idOwner;
  }
  set idOwner(value) {
    this.#idOwner = toNullableInt(value);
  }

  get location() {
    return this.#location;
  }
  set location(value) {
    this.#location = requiredText(value, "A localização", 150);
  }

  get numberOfRooms() {
    return this.#numberOfRooms;
  }
  set numberOfRooms(value) {
    const number = nonNegativeNumber(value, "O número de quartos");
    if (!Number.isInteger(number))
      throw new RangeError("O número de quartos deve ser inteiro");
    this.#numberOfRooms = number;
  }

  get availability() {
    return this.#availability;
  }
  set availability(value) {
    this.#availability = toBool(value);
  }

  get latePayment() {
    return this.#latePayment;
  }
  set latePayment(value) {
    this.#latePayment = toBool(value);
  }

  isAvailable() {
    return this.#availability;
  }
  hasLatePayment() {
    return this.#latePayment;
  }
  toggleAvailability() {
    this.#availability = !this.#availability;
    return this;
  }
  describe() {
    return `${this.#location} (${this.#numberOfRooms} quarto(s))`;
  }

  validate() {
    return this.#location === "" ? ["A localização é obrigatória."] : [];
  }

  static fromApi(p = {}) {
    return new Property({
      id: p.id_property ?? p.id,
      idOwner: p.id_owner,
      location: p.location ?? "",
      numberOfRooms: p.number_of_rooms ?? 0,
      availability: p.availability,
      latePayment: p.late_payment,
    });
  }

  toApi() {
    const body = {
      location: this.#location,
      number_of_rooms: this.#numberOfRooms,
      availability: this.#availability,
      late_payment: this.#latePayment,
    };
    if (this.#id !== null) body.id_property = this.#id; // o controller de update lê este campo
    return body;
  }

  toJSON() {
    return {
      id: this.id,
      idOwner: this.idOwner,
      location: this.location,
      numberOfRooms: this.numberOfRooms,
      availability: this.availability,
      latePayment: this.latePayment,
    };
  }
}
