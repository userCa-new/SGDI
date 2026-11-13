import CrudService from "./CrudService.js?v=20261113-2";
import Property from "../entities/Property.js";

export default class PropertyService extends CrudService {
  constructor(options = {}) {
    super({
      ...options,
      entity: Property,
      resource: "properties",
      routes: { mine: "mine", ...options.routes },
    });
  }
}
