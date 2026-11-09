import CrudService from "./CrudService.js";
import Property from "../entities/Property.js";

export default class PropertyService extends CrudService {
  constructor(options = {}) {
    super({ entity: Property, resource: "properties", ...options });
  }
}
