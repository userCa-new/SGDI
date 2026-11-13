import Entity, { toNullableInt, requiredText } from "./Entity.js";

export default class User extends Entity {
  static TYPES = Object.freeze({ TENANT: 1, OWNER: 2, ADMIN: 3 });
  static EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  #id = null;
  #userType = null;
  #name = "";
  #email = "";
  #password = "";
  #token = null;
  #photo = null;

  constructor({
    id = null,
    userType = null,
    name = "",
    email = "",
    password = "",
    token = null,
  } = {}) {
    super();
    this.id = id;
    this.userType = userType;
    if (name !== "") this.name = name;
    if (email !== "") this.email = email;
    if (password !== "") this.password = password;
    this.#token = token || null;
  }

  get id() {
    return this.#id;
  }
  set id(value) {
    this.#id = toNullableInt(value);
  }

  get userType() {
    return this.#userType;
  }
  set userType(value) {
    const type = toNullableInt(value);
    if (type !== null && !Object.values(User.TYPES).includes(type))
      throw new RangeError("Tipo de usuário inválido");
    this.#userType = type;
  }

  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = requiredText(value, "O nome", 100);
  }

  get email() {
    return this.#email;
  }
  set email(value) {
    const email = requiredText(value, "O e-mail", 150);
    if (!User.EMAIL_PATTERN.test(email))
      throw new TypeError("Informe um e-mail válido.");
    this.#email = email;
  }

  set password(value) {
    if (typeof value !== "string" || value.length < 6)
      throw new RangeError("A senha deve ter pelo menos 6 caracteres.");
    this.#password = value;
  }

  get photo() {
    return this.#photo;
  }

  set photo(value) {
    this.#photo = typeof value === "string" && value !== "" ? value : null;
  }

  get token() {
    return this.#token;
  }

  isOwner() {
    return this.#userType === User.TYPES.OWNER;
  }
  isTenant() {
    return this.#userType === User.TYPES.TENANT;
  }
  isAdmin() {
    return this.#userType === User.TYPES.ADMIN;
  }

  homePath() {
    if (this.isTenant()) return "../app/tenant.html";
    if (this.isOwner()) return "../app/owner.html";
    return "../app/index.html";
  }

  validate() {
    const errors = [];
    if (this.#name === "") errors.push("O nome é obrigatório.");
    if (this.#email === "") errors.push("O e-mail é obrigatório.");
    return errors;
  }

  static fromApi(p = {}) {
    return new User({
      id: p.id_user ?? p.id,
      userType: p.type_user ?? p.userType ?? null,
      name: p.name ?? "",
      email: p.email ?? "",
      token: p.token ?? null,
    });
  }

  static fromSession(stored) {
    return stored ? User.fromApi(stored) : null;
  }

  toRegisterPayload() {
    return {
      name: this.#name,
      email: this.#email,
      password: this.#password,
      type_user: this.#userType,
    };
  }

  toLoginPayload() {
    return { email: this.#email, password: this.#password };
  }

  toProfilePayload() {
    return { name: this.#name, email: this.#email, password: this.#password };
  }

  toApi() {
    return this.toRegisterPayload();
  }

  toJSON() {
    return {
      id_user: this.id,
      name: this.name,
      email: this.email,
      type_user: this.userType,
    };
  }
}
