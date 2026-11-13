import Contract from "../../_common/classes/entities/Contract.js";
import ContractService from "../../_common/classes/services/ContractService.js?v=20261113-2";
import PropertyService from "../../_common/classes/services/PropertyService.js?v=20261113-2";
import { createFormController } from "../../_common/prototypes/FormController.js";
import { createToast } from "../../_common/prototypes/Toast.js";

const formElement = document.querySelector("#owner-contract-form");
const list = document.querySelector("#owner-contract-list");
if (formElement && list) {
  const form = createFormController(formElement);
  const service = new ContractService();
  const propertyService = new PropertyService();
  const toast = createToast();
  const propertySelect = formElement.elements.idProperty;
  const tenantSelect = formElement.elements.idUser;
  let properties = [];
  let tenants = [];
  let contracts = [];
  let editing = null;
  let saving = false;

  const state = (message, kind = "empty") => {
    const item = document.createElement("p");
    item.className = `management-state management-state--${kind}`;
    item.setAttribute("role", kind === "error" ? "alert" : "status");
    item.textContent = message;
    list.replaceChildren(item);
  };

  function fillSelect(select, items, placeholder, label) {
    const options = items.map((item) => {
      const option = document.createElement("option");
      option.value = String(item.id ?? item.id_user);
      option.textContent = label(item);
      return option;
    });
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.replaceChildren(first, ...options);
  }

  function render() {
    if (!contracts.length) {
      state("Nenhum contrato cadastrado para os seus imóveis.");
      return;
    }

    const cards = contracts.map((contract) => {
      const property = properties.find((item) => item.id === contract.idProperty);
      const tenant = tenants.find((item) => Number(item.id_user) === contract.idUser);
      const card = document.createElement("article");
      card.className = "management-card";
      const title = document.createElement("h3");
      title.textContent = property?.location ?? `Imóvel #${contract.idProperty}`;
      const details = document.createElement("p");
      details.textContent = `${tenant?.name ?? `Inquilino #${contract.idUser}`} · R$ ${contract.rentValue.toFixed(2)} ao mês · ${Contract.STATUS_LABEL[contract.status]} · ${contract.startDate} a ${contract.endDate ?? "—"}`;
      const actions = document.createElement("footer");
      actions.className = "management-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button-secondary";
      edit.dataset.action = "edit";
      edit.dataset.id = String(contract.id);
      edit.textContent = "Editar";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button-danger";
      remove.dataset.action = "delete";
      remove.dataset.id = String(contract.id);
      remove.textContent = "Remover";
      actions.append(edit, remove);
      card.append(title, details, actions);
      return card;
    });
    list.replaceChildren(...cards);
  }

  async function load() {
    state("Carregando contratos…", "loading");
    try {
      const [propertyResponse, tenantResponse, contractResponse] = await Promise.all([
        propertyService.listMine(),
        service.listTenants(),
        service.listMine(),
      ]);
      for (const response of [propertyResponse, tenantResponse, contractResponse]) {
        if (response.type !== "success") {
          state(response.message || "Não foi possível carregar os contratos.", "error");
          toast.fromResponse(response);
          return;
        }
      }
      properties = propertyResponse.data;
      tenants = tenantResponse.data;
      contracts = contractResponse.data;
      fillSelect(propertySelect, properties, "Selecione um imóvel…", (p) => p.location);
      fillSelect(tenantSelect, tenants, "Selecione um inquilino…", (t) => t.name);
      render();
    } catch (error) {
      state(error.message, "error");
      toast.fromError(error);
    }
  }

  function cancelEdit() {
    editing = null;
    form.clear();
    formElement.querySelector('[type="submit"]').textContent = "Salvar contrato";
    formElement.querySelector("[data-cancel-contract]").hidden = true;
    formElement.querySelector("h2")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.onSubmit(async (values, errors) => {
    if (saving) return;
    let contract;
    try {
      contract = new Contract({
        id: editing?.id ?? null,
        idProperty: values.idProperty,
        idUser: values.idUser,
        rentValue: values.rentValue,
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      });
    } catch (error) {
      toast.fromError(error);
      return;
    }
    const validationErrors = [...errors, ...contract.validate()];
    if (validationErrors.length) {
      toast.show([...new Set(validationErrors)].join(" "), "warning");
      return;
    }

    saving = true;
    form.setLoading(true, editing ? "Atualizando…" : "Salvando…");
    try {
      const response = editing
        ? await service.update(contract)
        : await service.createForTenant(contract, contract.idUser);
      if (toast.fromResponse(response)) {
        cancelEdit();
        await load();
      }
    } catch (error) {
      toast.fromError(error);
    } finally {
      form.setLoading(false);
      saving = false;
    }
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || saving) return;
    const contract = contracts.find((item) => item.id === Number(button.dataset.id));
    if (!contract) return;
    if (button.dataset.action === "edit") {
      editing = contract;
      form.fill({
        idProperty: contract.idProperty,
        idUser: contract.idUser,
        rentValue: contract.rentValue,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
      });
      formElement.querySelector('[type="submit"]').textContent = "Salvar alterações";
      formElement.querySelector("[data-cancel-contract]").hidden = false;
      propertySelect.focus();
      return;
    }
    if (
      button.dataset.action === "delete" &&
      window.confirm("Remover este contrato? O registro será excluído da base de dados.")
    ) {
      saving = true;
      try {
        const response = await service.remove(contract.id);
        if (toast.fromResponse(response)) await load();
      } catch (error) {
        toast.fromError(error);
      } finally {
        saving = false;
      }
    }
  });

  formElement.querySelector("[data-cancel-contract]").addEventListener("click", cancelEdit);
  load();
}
