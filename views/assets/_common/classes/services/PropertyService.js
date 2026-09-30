import CrudService from "./CrudService.js";
import Property from "../entities/Property.js";

/** /api/properties — insert/update/delete exigem perfil Proprietário (2). */
export default class PropertyService extends CrudService {
    constructor(options = {}) {
        super({ entity: Property, resource: "properties", ...options });
    }
}
