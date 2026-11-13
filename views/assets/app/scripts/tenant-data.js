import Appointment from "../../_common/classes/entities/Appointment.js";
import AppointmentService from "../../_common/classes/services/AppointmentService.js";
import ContractService from "../../_common/classes/services/ContractService.js";
import PropertyService from "../../_common/classes/services/PropertyService.js?v=20261113-2";
import { createFormController } from "../../_common/prototypes/FormController.js";
import { createToast } from "../../_common/prototypes/Toast.js";

const contractList = document.querySelector("#tenant-contract-list");
const appointmentList = document.querySelector("#tenant-appointment-list");
const appointmentFormElement = document.querySelector("#tenant-appointment-form");

if (contractList && appointmentList && appointmentFormElement) {
  const toast = createToast();
  const contractService = new ContractService();
  const propertyService = new PropertyService();
  const appointmentService = new AppointmentService();
  const form = createFormController(appointmentFormElement);
  const propertySelect = appointmentFormElement.elements.idProperty;
  let properties = [];
  let contracts = [];
  let appointments = [];
  let saving = false;

  function showState(container, message, kind = "empty") {
    const state = document.createElement("p");
    state.className = `management-state management-state--${kind}`;
    state.setAttribute("role", kind === "error" ? "alert" : "status");
    state.textContent = message;
    container.replaceChildren(state);
  }

  function renderContracts() {
    if (!contracts.length) {
      showState(
        contractList,
        "Você ainda não possui contrato cadastrado. O proprietário precisa associar um imóvel ao seu perfil.",
      );
      return;
    }
    contractList.replaceChildren(...contracts.map((contract) => {
      const property = properties.find((item) => item.id === contract.idProperty);
      const card = document.createElement("article");
      card.className = "management-card";
      const title = document.createElement("h3");
      title.textContent = property?.location ?? `Imóvel #${contract.idProperty}`;
      const detail = document.createElement("p");
      detail.textContent = `Aluguel mensal: R$ ${contract.rentValue.toFixed(2)} · ${contract.status === "ACTIVE" ? "Ativo" : contract.status === "CLOSED" ? "Encerrado" : "Pendente"} · Vigência: ${contract.startDate} a ${contract.endDate ?? "—"}`;
      card.append(title, detail);
      return card;
    }));
  }

  function renderAppointments() {
    if (!appointments.length) {
      showState(appointmentList, "Você ainda não possui atendimentos registrados.");
      return;
    }
    appointmentList.replaceChildren(...appointments.map((appointment) => {
      const property = properties.find((item) => item.id === appointment.idProperty);
      const card = document.createElement("article");
      card.className = "management-card";
      const title = document.createElement("h3");
      title.textContent = property?.location ?? `Imóvel #${appointment.idProperty}`;
      const detail = document.createElement("p");
      detail.textContent = `${appointment.date} · ${appointment.observation} · ${appointment.isCompleted() ? "Concluído" : "Pendente"}`;
      const actions = document.createElement("footer");
      actions.className = "management-actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button-danger";
      remove.dataset.id = String(appointment.id);
      remove.textContent = "Cancelar solicitação";
      remove.disabled = appointment.isCompleted();
      actions.append(remove);
      card.append(title, detail, actions);
      return card;
    }));
  }

  async function load() {
    showState(contractList, "Carregando seus dados…", "loading");
    try {
      const [propertyResponse, contractResponse, appointmentResponse] = await Promise.all([
        propertyService.listMine(),
        contractService.listMine(),
        appointmentService.list(),
      ]);
      const failed = [propertyResponse, contractResponse, appointmentResponse]
        .find((response) => response.type !== "success");
      if (failed) {
        showState(contractList, failed.message || "Não foi possível carregar os dados da locação.", "error");
        showState(appointmentList, failed.message || "Não foi possível carregar os atendimentos.", "error");
        toast.fromResponse(failed);
        return;
      }

      contracts = contractResponse.data;
      const activePropertyIds = new Set(
        contracts
          .filter((contract) => contract.isActive())
          .map((contract) => contract.idProperty),
      );
      properties = propertyResponse.data.filter((property) =>
        activePropertyIds.has(property.id),
      );
      appointments = appointmentResponse.data;
      const options = properties.map((property) => {
        const option = document.createElement("option");
        option.value = String(property.id);
        option.textContent = property.location;
        return option;
      });
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecione um imóvel…";
      propertySelect.replaceChildren(placeholder, ...options);
      propertySelect.disabled = properties.length === 0;
      appointmentFormElement.querySelector('[type="submit"]').disabled = properties.length === 0;
      if (!properties.length) {
        showState(
          appointmentList,
          "Nenhum imóvel com contrato ativo. Peça ao proprietário para ativar seu contrato para liberar atendimentos.",
        );
      } else {
        renderAppointments();
      }
      renderContracts();
    } catch (error) {
      showState(contractList, error.message, "error");
      showState(appointmentList, error.message, "error");
      toast.fromError(error);
    }
  }

  form.onSubmit(async (values, errors) => {
    if (saving) return;
    let appointment;
    try {
      appointment = new Appointment({
        idProperty: values.idProperty,
        date: values.date,
        observation: values.observation,
      });
    } catch (error) {
      toast.fromError(error);
      return;
    }
    const validationErrors = [...errors, ...appointment.validate()];
    if (validationErrors.length) {
      toast.show([...new Set(validationErrors)].join(" "), "warning");
      return;
    }
    saving = true;
    form.setLoading(true, "Enviando solicitação…");
    try {
      const response = await appointmentService.create(appointment);
      if (toast.fromResponse(response)) {
        form.clear();
        await load();
      }
    } catch (error) {
      toast.fromError(error);
    } finally {
      form.setLoading(false);
      saving = false;
    }
  });

  appointmentList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button || button.disabled || saving) return;
    const appointment = appointments.find((item) => item.id === Number(button.dataset.id));
    if (!appointment || !window.confirm("Cancelar esta solicitação de atendimento?")) return;
    saving = true;
    button.disabled = true;
    try {
      const response = await appointmentService.remove(appointment.id);
      if (toast.fromResponse(response)) await load();
    } catch (error) {
      toast.fromError(error);
    } finally {
      saving = false;
      button.disabled = false;
    }
  });

  load();
}
