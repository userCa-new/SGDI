import CrudService from "./CrudService.js";
import Appointment from "../entities/Appointment.js";

/**
 * /api/appointments — insert e delete exigem Inquilino (1); update exige
 * Proprietário (2) e o controller só altera o campo `completed`.
 */
export default class AppointmentService extends CrudService {
    constructor(options = {}) {
        super({ entity: Appointment, resource: "appointments", ...options });
    }

    updatePayload(appointment) {
        return appointment.toCompletionPayload();
    }
}
