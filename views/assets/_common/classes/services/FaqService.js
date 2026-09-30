import CrudService from "./CrudService.js";
import Faq from "../entities/Faq.js";

/** /api/faqs — a área pública só usa a listagem (GET /faqs/list). */
export default class FaqService extends CrudService {
    constructor(options = {}) {
        super({ entity: Faq, resource: "faqs", routes: { list: "list" }, ...options });
    }
}
