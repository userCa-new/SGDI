import CrudService from "./CrudService.js";
import Faq from "../entities/Faq.js";

export default class FaqService extends CrudService {
  constructor(options = {}) {
    super({
      entity: Faq,
      resource: "faqs",
      routes: { list: "list" },
      ...options,
    });
  }
}
