import CrudService from "./CrudService.js?v=20261113-2";
import Contract from "../entities/Contract.js";

export default class ContractService extends CrudService {
  constructor(options = {}) {
    super({ entity: Contract, resource: "contracts", ...options });
  }

  async listMine() {
    const response = await this.get("/contracts/listAll");
    return response.type === "success"
      ? { ...response, data: Contract.fromApiList(response.data) }
      : response;
  }

  async listTenants() {
    return this.get("/users/tenants");
  }

  createForTenant(contract, tenantId) {
    return this.post("/contracts/insert", {
      ...contract.toApi(),
      id_user: tenantId,
    });
  }

  update(contract) {
    return this.put(
      `/contracts/update/${encodeURIComponent(contract.id)}`,
      { ...contract.toApi(), id_user: contract.idUser },
    );
  }
}
