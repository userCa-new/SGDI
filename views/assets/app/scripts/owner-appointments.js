import AppointmentService from "../../_common/classes/services/AppointmentService.js";
import PropertyService from "../../_common/classes/services/PropertyService.js?v=20261113-2";
import { createToast } from "../../_common/prototypes/Toast.js";

const list = document.querySelector("#owner-appointment-list");
if (list) {
  const service = new AppointmentService();
  const propertyService = new PropertyService();
  const toast = createToast();
  let properties = [];
  let appointments = [];
  let saving = false;

  function showState(message, kind = "empty") {
    const state = document.createElement("p");
    state.className = `management-state management-state--${kind}`;
    state.setAttribute("role", kind === "error" ? "alert" : "status");
    state.textContent = message;
    list.replaceChildren(state);
  }

  function render() {
    if (!appointments.length) {
      showState("Nenhum atendimento registrado para os seus imóveis.");
      return;
    }
    list.replaceChildren(...appointments.map((appointment) => {
      const card = document.createElement("article");
      card.className = "management-card";
      const property = properties.find((item) => item.id === appointment.idProperty);
      const title = document.createElement("h3");
      title.textContent = property?.location ?? `Imóvel #${appointment.idProperty}`;
      const detail = document.createElement("p");
      detail.textContent = `${appointment.date} · ${appointment.observation} · ${appointment.isCompleted() ? "Concluído" : "Pendente"}`;
      const actions = document.createElement("footer");
      actions.className = "management-actions";
      const button = document.createElement("button");
      button.type = "button";
      button.className = appointment.isCompleted() ? "button-secondary" : "";
      button.dataset.id = String(appointment.id);
      button.textContent = appointment.isCompleted() ? "Reabrir" : "Concluir";
      actions.append(button);
      card.append(title, detail, actions);
      return card;
    }));
  }

  async function load() {
    showState("Carregando atendimentos…", "loading");
    try {
      const [propertiesResponse, appointmentsResponse] = await Promise.all([
        propertyService.listMine(),
        service.list(),
      ]);
      if (propertiesResponse.type !== "success" || appointmentsResponse.type !== "success") {
        const response = propertiesResponse.type !== "success" ? propertiesResponse : appointmentsResponse;
        showState(response.message || "Não foi possível carregar os atendimentos.", "error");
        toast.fromResponse(response);
        return;
      }
      properties = propertiesResponse.data;
      appointments = appointmentsResponse.data;
      render();
    } catch (error) {
      showState(error.message, "error");
      toast.fromError(error);
    }
  }

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button || saving) return;
    const appointment = appointments.find((item) => item.id === Number(button.dataset.id));
    if (!appointment) return;
    const wasCompleted = appointment.completed;
    wasCompleted ? appointment.reopen() : appointment.markCompleted();
    saving = true;
    button.disabled = true;
    try {
      const response = await service.update(appointment);
      if (toast.fromResponse(response)) await load();
      else {
        appointment.completed = wasCompleted;
        render();
      }
    } catch (error) {
      appointment.completed = wasCompleted;
      toast.fromError(error);
      render();
    } finally {
      saving = false;
    }
  });

  load();
}
