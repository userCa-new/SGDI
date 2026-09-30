import CrudService from "./CrudService.js";
import Contract from "../entities/Contract.js";

/** /api/contracts — insert/update exigem perfil Proprietário (2). */
export default class ContractService extends CrudService {
    constructor(options = {}) {
        super({ entity: Contract, resource: "contracts", ...options });
    }
}
