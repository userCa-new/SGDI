export default class Appointment {
    #idUser;
    #idUserType;
    #name;
    #email;
    #password;
    #token;

    constructor({ id: idUser = null, idUserType = null, name = null, email = null, password = null, token = null } = {}) {
        this.idUser = idUser;
        this.idUserType = idUserType;
        this.name = name;
        this.email = email;
        this.password = password;
        this.token = token;
    }

    get idUser() {
        return this.#idUser;
    }

    set idUser(idUser) {
        this.#idUser = idUser === null ? null : Number(idUser);
    }

    get idUserType() {
        return this.#idUserType;
    }

    set idUserType(idUserType) {
        this.#idUserType = this.#idUserType === null ? null : Number(idUserType);
    }

    get date() {
        return this.#name;
    }

    set name(name) {
         if (typeof name !== "string" || name.trim() === "") {
            throw new TypeError("O nome é obrigatório");
        }
        this.#name = name.trim();
    }

    get email ()
    {
        return this.#email;
    }

    set email (email)
    {
         if (typeof email !== "string" || email.trim() === "") {
            throw new TypeError("O email é obrigatório");
        }
        this.#email = email.trim();

    }

    get password ()
    {
        return this.#password;
    }

    set password (password)
    {
         if (typeof password !== "string" || password.trim() === "") {
            throw new TypeError("A senha é obrigatória");
        }
        this.#password = password.trim();
    }

    get token ()
    {
        return this.#token;
    }

    set token (token)
    {
         if (typeof token !== "string" || token.trim() === "") {
            throw new TypeError("O token é obrigatório");
        }
        this.#token = token.trim();
    }


    toJSON() {
        return { idUser: this.idUser, idUserType: this.idUserType, name: this.name, email: this.email, password: this.password};
    }
}