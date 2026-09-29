export default class Payment {
    #idPayment;
    #idContract;
    #pix;
    #qr_code;
    #receipt;
    #value;
    #paymentDate;
    #status;

    constructor({ idPayment = null, idContract = null, pix = null, qr_code = null, receipt = null, value = 0, paymentDate = null, status = null } = {}) {
        this.idPayment = idPayment;
        this.idContract = idContract;
        this.pix = pix;
        this.qr_code = qr_code;
        this.receipt = receipt;
        this.value = value;
        this.paymentDate = paymentDate;
        this.status = status;
    }
    get idPayment() {
        return this.#idPayment;
    }

    set idPayment(value) {
        this.#idPayment = value === null ? null : Number(value);
    }
    
    get idContract() {
        return this.#idContract;
    }

    set idContract(value) {
        this.#idContract = value === null ? null : Number(value);
    }

    get pix() {
        return this.#pix;
    }

    set pix(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O pix é obrigatório");
        }
        this.#pix = value.trim();
    }

    get qrCode() {
        return this.#qr_code;
    }

    set qrCode(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O QR Code é obrigatório");
        }
        this.#qr_code = value.trim();
    }
    get receipt() {
        return this.#receipt;
    }

    set receipt(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O recibo é obrigatório");
        }
        this.#receipt = value.trim();
    }

    get value() {
        return this.#value;
    }

    set value(valor) {
        const number = Number(valor);
        if (!Number.isFinite(number) || number < 0) {
            throw new RangeError("O valor do recibo deve ser um número não negativo");
        }
        this.#value = number;
    }
    get paymentDate() {
        return this.#paymentDate;
    }

    set paymentDate(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A data do pagamento é obrigatória");
        }
        this.#paymentDate = value.trim();
    }
    get status() {
        return this.#status;
    }

    set status(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O status é obrigatório");
        }
        this.#status = value.trim();
    }


    toJSON() {
        return { idPayment: this.idPayment, idContract: this.idContract, 
            pix: this.#pix, qr_code: this.qr_code, receipt: this.receipt,
        value: this.value, paymentDate: this.paymentDate, status: this.status };
    }
}

