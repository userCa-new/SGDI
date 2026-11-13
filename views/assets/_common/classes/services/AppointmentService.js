import CrudService from "./CrudService.js?v=20261113-2";
import Appointment from "../entities/Appointment.js";

export default class AppointmentService extends CrudService {
  constructor(options = {}) {
    super({ entity: Appointment, resource: "appointments", ...options });
  }

  updatePayload(appointment) {
    return appointment.toCompletionPayload();
  }
}
