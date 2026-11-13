import SessionStorage from "../../_common/scripts/storage.js";
import User from "../../_common/classes/entities/User.js";
import Property from "../../_common/classes/entities/Property.js";
import PropertyService from "../../_common/classes/services/PropertyService.js?v=20261113-2";
import PropertyImageService from "../../_common/classes/services/PropertyImageService.js";
import { createGalleryController } from "../../_common/prototypes/GalleryController.js";
import { createToast } from "../../_common/prototypes/Toast.js";
import { createFormController } from "../../_common/prototypes/FormController.js";

const storage = new SessionStorage();
const user = User.fromSession(storage.getUser());
const trigger = document.querySelector("#owner-properties-button");
if (!trigger || !user?.isOwner()) {
  if (trigger) trigger.hidden = true;
} else {
  const propertyService = new PropertyService();
  const modal = document.createElement("section");
  modal.id = "owner-properties-modal";
  modal.className = "modal-backdrop owner-properties-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <section class="owner-properties-dialog" role="dialog" aria-modal="true" aria-labelledby="owner-properties-title">
      <header class="owner-properties-heading">
        <section>
          <p class="eyebrow">Painel do proprietário</p>
          <h2 id="owner-properties-title">Imóveis e imagens</h2>
          <p>Cadastros e galeria ficam sincronizados com a API.</p>
        </section>
        <button type="button" class="modal-close" data-close aria-label="Fechar">×</button>
      </header>
      <section class="owner-properties-layout">
        <section class="owner-property-section" aria-labelledby="owner-property-title">
          <header>
            <h3 id="owner-property-title">Cadastrar imóvel</h3>
            <p>Edite os dados e gerencie a galeria dos seus imóveis.</p>
          </header>
          <form id="owner-property-form" class="owner-property-form" novalidate>
            <label>
              Localização
              <input name="location" type="text" required maxlength="150" autocomplete="street-address" />
            </label>
            <label>
              Quartos
              <input name="numberOfRooms" type="number" min="0" step="1" required inputmode="numeric" value="1" />
            </label>
            <label class="owner-property-check">
              <input name="availability" type="checkbox" checked />
              Disponível para locação
            </label>
            <label class="owner-property-check">
              <input name="latePayment" type="checkbox" />
              Pagamento em atraso
            </label>
            <footer class="management-actions">
              <button type="submit">Salvar imóvel</button>
              <button type="button" class="button-secondary" data-cancel-edit hidden>Cancelar edição</button>
            </footer>
          </form>
          <ul id="owner-property-list" class="owner-property-list" aria-live="polite"></ul>
        </section>
        <section class="owner-property-section owner-gallery-section" aria-labelledby="owner-gallery-title">
          <header>
            <h3 id="owner-gallery-title">Galeria de imagens</h3>
            <p>Adicione, consulte ou remova imagens do imóvel selecionado.</p>
          </header>
          <label for="owner-gallery-property">Imóvel</label>
          <select id="owner-gallery-property">
            <option value="">Selecione um imóvel…</option>
          </select>
          <p id="owner-gallery-rules" class="hint"></p>
          <header id="owner-gallery-location" class="owner-gallery-location" hidden>
            <p>Imóvel selecionado</p>
            <h4 id="owner-gallery-location-text"></h4>
            <p id="owner-gallery-location-meta"></p>
          </header>
          <form id="owner-gallery-form" class="owner-gallery-form" novalidate hidden>
            <label for="owner-gallery-files">Adicionar imagens</label>
            <input id="owner-gallery-files" type="file" multiple accept="image/jpeg,image/png,image/webp" />
            <p id="owner-gallery-counter" class="hint" aria-live="polite"></p>
            <section id="owner-gallery-pending" class="owner-gallery-pending" aria-label="Imagens selecionadas"></section>
            <footer class="management-actions">
              <button type="submit" disabled>Enviar imagens</button>
              <button type="button" class="button-secondary" data-action="clear">Limpar seleção</button>
            </footer>
          </form>
          <section id="owner-gallery-list" class="owner-gallery-list" aria-live="polite" aria-label="Imagens do imóvel selecionado"></section>
        </section>
      </section>
      <footer class="owner-properties-footer">
        <button type="button" class="button-secondary" data-close>Fechar</button>
      </footer>
    </section>
  `;
  document.body.append(modal);
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", modal.id);

  const $ = (selector) => modal.querySelector(selector);
  const dialog = modal.querySelector(".owner-properties-dialog");
  const formElement = $("#owner-property-form");
  const form = createFormController(formElement);
  const propertyList = $("#owner-property-list");
  const toast = createToast({ container: dialog, inline: true });
  let properties = [];
  let editing = null;
  let saving = false;

  const gallery = createGalleryController({
    form: createFormController($("#owner-gallery-form")),
    select: $("#owner-gallery-property"),
    fileInput: $("#owner-gallery-files"),
    pendingList: $("#owner-gallery-pending"),
    counterEl: $("#owner-gallery-counter"),
    list: $("#owner-gallery-list"),
    rules: $("#owner-gallery-rules"),
    locationBox: $("#owner-gallery-location"),
    locationText: $("#owner-gallery-location-text"),
    locationMeta: $("#owner-gallery-location-meta"),
    service: new PropertyImageService(),
    toast,
    canEdit: (property) => property.idOwner === user.id,
  });
  gallery.init();

  function showState(message, kind = "empty") {
    const state = document.createElement("li");
    state.className = `management-state management-state--${kind}`;
    state.setAttribute("role", kind === "error" ? "alert" : "status");
    state.textContent = message;
    propertyList.replaceChildren(state);
  }

  function syncProperties() {
    window.sgdiProperties = properties;
    document.dispatchEvent(new CustomEvent("sgdi:properties-updated"));
    gallery.setProperties(properties);
  }

  function renderProperties() {
    if (properties.length === 0) {
      showState("Você ainda não cadastrou imóveis.");
      return;
    }

    const items = properties.map((property) => {
      const item = document.createElement("li");
      const title = document.createElement("h3");
      title.textContent = property.location;
      const details = document.createElement("p");
      details.textContent = `Imóvel #${property.id} · ${property.numberOfRooms} quarto(s) · ${property.isAvailable() ? "Disponível" : "Indisponível"} · ${property.hasLatePayment() ? "Pagamento em atraso" : "Sem atraso informado"}`;
      const actions = document.createElement("footer");
      actions.className = "management-actions";

      for (const [action, label, style] of [
        ["gallery", "Galeria", "button-secondary"],
        ["edit", "Editar", "button-secondary"],
        ["delete", "Remover", "button-danger"],
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = style;
        button.dataset.action = action;
        button.dataset.id = String(property.id);
        button.textContent = label;
        actions.append(button);
      }

      item.append(title, details, actions);
      return item;
    });
    propertyList.replaceChildren(...items);
  }

  async function loadProperties() {
    showState("Carregando imóveis…", "loading");
    try {
      const response = await propertyService.listMine();
      if (response.type !== "success") {
        properties = [];
        syncProperties();
        showState(response.message || "Não foi possível carregar os imóveis.", "error");
        toast.fromResponse(response);
        return;
      }
      properties = response.data;
      syncProperties();
      renderProperties();
    } catch (error) {
      properties = [];
      syncProperties();
      showState(error.message, "error");
      toast.fromError(error);
    }
  }

  function cancelEdit() {
    editing = null;
    form.clear();
    delete formElement.dataset.mode;
    formElement.querySelector('[type="submit"]').textContent = "Salvar imóvel";
    $("#owner-property-title").textContent = "Cadastrar imóvel";
    $("[data-cancel-edit]").hidden = true;
  }

  form.onSubmit(async (values, errors) => {
    if (saving) return;
    let property;
    try {
      property = new Property({
        id: editing?.id ?? null,
        idOwner: user.id,
        location: values.location,
        numberOfRooms: values.numberOfRooms,
        availability: values.availability,
        latePayment: values.latePayment,
      });
    } catch (error) {
      toast.fromError(error);
      return;
    }

    const validationErrors = [...errors, ...property.validate()];
    if (validationErrors.length) {
      toast.show([...new Set(validationErrors)].join(" "), "warning");
      return;
    }

    saving = true;
    form.setLoading(true, editing ? "Atualizando…" : "Salvando…");
    try {
      const response = editing
        ? await propertyService.update(property)
        : await propertyService.create(property);
      if (toast.fromResponse(response)) {
        cancelEdit();
        await loadProperties();
      }
    } catch (error) {
      toast.fromError(error);
    } finally {
      form.setLoading(false);
      saving = false;
    }
  });

  propertyList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || saving) return;
    const property = properties.find((item) => item.id === Number(button.dataset.id));
    if (!property) return;

    if (button.dataset.action === "gallery") {
      await gallery.selectProperty(property.id);
      $("#owner-gallery-title").scrollIntoView({ behavior: "smooth" });
      $("#owner-gallery-files").focus({ preventScroll: true });
      return;
    }
    if (button.dataset.action === "edit") {
      editing = property;
      form.fill({
        location: property.location,
        numberOfRooms: property.numberOfRooms,
        availability: property.availability,
        latePayment: property.latePayment,
      });
      formElement.dataset.mode = "edit";
      formElement.querySelector('[type="submit"]').textContent = "Salvar alterações";
      $("#owner-property-title").textContent = "Editar imóvel";
      $("[data-cancel-edit]").hidden = false;
      formElement.elements.location.focus();
      return;
    }
    if (
      button.dataset.action === "delete" &&
      window.confirm(`Remover "${property.location}" e as imagens cadastradas? Imóveis com contratos ou atendimentos vinculados não podem ser removidos.`)
    ) {
      saving = true;
      try {
        const response = await propertyService.remove(property.id);
        if (toast.fromResponse(response)) {
          if (editing?.id === property.id) cancelEdit();
          await loadProperties();
        }
      } catch (error) {
        toast.fromError(error);
      } finally {
        saving = false;
      }
    }
  });

  $("[data-cancel-edit]").addEventListener("click", cancelEdit);

  function close() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    trigger.focus();
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close]")) close();
  });
  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
  trigger.addEventListener("sgdi:open-properties", async () => {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    await loadProperties();
    formElement.elements.location.focus();
  });

  loadProperties();
}
