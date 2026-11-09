import CrudService from "./CrudService.js";
import Contract from "../entities/Contract.js";

export default class ContractService extends CrudService {
  constructor(options = {}) {
    super({ entity: Contract, resource: "contracts", ...options });
  }
}
