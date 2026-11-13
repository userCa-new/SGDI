import { IMAGE_RULES, validateImageFileDeep } from "../scripts/image-rules.js";

const HASH = /^#galeria-(\d+)$/;

export const GalleryControllerPrototype = {
  init() {
    const initial = HASH.exec(window.location.hash);
    this.initialId = initial ? Number(initial[1]) : null;

    this.rules.textContent = `${IMAGE_RULES.description} · até ${IMAGE_RULES.maxFilesPerRequest} por envio · máximo de ${IMAGE_RULES.maxImagesPerProperty} por imóvel.`;
    this.fileInput.accept = IMAGE_RULES.accept;
    this.fileInput.multiple = true;

    this.select.addEventListener("change", () =>
      this.selectProperty(this.select.value),
    );
    this.fileInput.addEventListener("change", () =>
      this.addFiles([...this.fileInput.files]),
    );
    this.form.form
      .querySelector("[data-action='clear']")
      ?.addEventListener("click", () => this.clearPending());
    this.form.onSubmit(() => this.upload());

    this.pendingList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-pending]");
      if (button) this.removePending(button.dataset.pending);
    });
    this.pendingList.addEventListener("input", (event) => {
      const field = event.target.closest("input[data-alt]");
      const item = this.pending.find((p) => p.key === field?.dataset.alt);
      if (item) item.alt = field.value;
    });
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-remove]");
      const image = this.images.find(
        (i) => i.id === Number(button?.dataset.remove),
      );
      if (image) this.removeImage(image);
    });
    window.addEventListener("hashchange", () => {
      const match = HASH.exec(window.location.hash);
      if (match && Number(match[1]) !== this.propertyId)
        this.selectProperty(match[1], false);
    });

    this.showState("empty", "Selecione um imóvel para ver a galeria.");
    this.renderPending();
  },

  setProperties(properties) {
    this.properties = properties;
    const current = this.propertyId;
    const options = properties.map((property) => {
      const option = this.select.ownerDocument.createElement("option");
      option.value = String(property.id);
      option.textContent = `#${property.id} — ${property.location}`;
      return option;
    });
    const placeholder = this.select.ownerDocument.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um imóvel…";
    this.select.replaceChildren(placeholder, ...options);

    const wanted = current ?? this.initialId;
    this.initialId = null;
    if (wanted !== null && properties.some((p) => p.id === Number(wanted))) {
      this.select.value = String(wanted);
      if (current === null) this.selectProperty(wanted, false);
      else this.applyPermissions();
    } else if (current !== null) {
      this.propertyId = null; // o imóvel selecionado deixou de existir
      this.clearPending();
      this.images = [];
      this.form.form.hidden = true;
      this.showLocation();
      this.showState("empty", "Selecione um imóvel para ver a galeria.");
    }
  },

  currentProperty() {
    return this.properties.find((p) => p.id === this.propertyId) ?? null;
  },

  showLocation() {
    if (!this.locationBox) return;
    const property = this.currentProperty();
    this.locationBox.hidden = !property;
    if (!property) return;
    if (this.locationText) this.locationText.textContent = property.location;
    if (this.locationMeta) {
      this.locationMeta.textContent = `Imóvel #${property.id} · ${property.numberOfRooms} quarto(s) · ${property.isAvailable() ? "Disponível" : "Indisponível"}`;
    }
  },

  applyPermissions() {
    const property = this.currentProperty();
    this.editable = Boolean(property && this.canEdit(property));
    this.form.form.hidden = !this.editable;
    this.showLocation();
    this.render();
  },

  async selectProperty(id, updateHash = true) {
    const value = id === "" || id === null ? null : Number(id);
    this.clearPending();
    if (value === null || !this.properties.some((p) => p.id === value)) {
      this.propertyId = null;
      this.images = [];
      this.select.value = "";
      this.form.form.hidden = true;
      this.showLocation();
      if (updateHash && window.location.hash)
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      this.showState("empty", "Selecione um imóvel para ver a galeria.");
      return;
    }
    this.propertyId = value;
    this.select.value = String(value);
    if (updateHash) window.location.hash = `galeria-${value}`;
    this.applyPermissions();
    await this.load();
  },

  showState(kind, message) {
    const p = this.list.ownerDocument.createElement("p");
    p.className = `crud-state crud-state--${kind}`;
    p.setAttribute("role", kind === "error" ? "alert" : "status");
    p.textContent = message;
    this.list.replaceChildren(p);
  },

  async load() {
    const propertyId = this.propertyId;
    this.showState("loading", "Carregando imagens…");
    try {
      const response = await this.service.list(propertyId);
      if (propertyId !== this.propertyId) return; // o usuário trocou de imóvel durante a espera
      if (response.type !== "success") {
        this.images = [];
        this.showState(
          "error",
          response.message || "Não foi possível carregar a galeria.",
        );
        this.toast.fromResponse(response);
        return;
      }
      this.images = response.data.images;
      this.render();
    } catch (error) {
      this.images = [];
      this.showState("error", error.message);
      this.toast.fromError(error);
    }
  },

  render() {
    if (this.propertyId === null) return;
    if (this.images.length === 0) {
      const place = this.currentProperty()?.location;
      this.showState(
        "empty",
        place
          ? `O imóvel em ${place} ainda não tem imagens.`
          : "Este imóvel ainda não tem imagens.",
      );
      return;
    }
    const doc = this.list.ownerDocument;
    const location = this.currentProperty()?.location ?? "";
    const grid = doc.createElement("ul");
    grid.className = "gallery-grid";

    for (const image of this.images) {
      const item = doc.createElement("li");
      item.className = "gallery-item";
      const figure = doc.createElement("figure");
      figure.dataset.imageId = String(image.id);

      if (image.url) {
        const img = doc.createElement("img");
        img.src = image.url;
        img.alt =
          image.altText ||
          (location ? `Imagem do imóvel em ${location}` : image.describe());
        img.loading = "lazy";
        figure.appendChild(img);
      } else {
        const missing = doc.createElement("p");
        missing.className = "gallery-missing";
        missing.textContent = "Imagem indisponível";
        figure.appendChild(missing);
      }

      const caption = doc.createElement("figcaption");
      const text = doc.createElement("span");
      if (location) {
        const place = doc.createElement("strong");
        place.className = "gallery-item-location";
        place.textContent = location;
        text.append(place, doc.createElement("br"));
      }
      text.append(image.altText || "(sem texto alternativo)");
      caption.appendChild(text);
      if (this.editable) {
        const button = doc.createElement("button");
        button.type = "button";
        button.dataset.remove = String(image.id);
        button.textContent = "Remover";
        caption.appendChild(button);
      }
      figure.appendChild(caption);
      item.appendChild(figure);
      grid.appendChild(item);
    }
    this.list.replaceChildren(grid);
  },

  async addFiles(files) {
    if (!this.editable || files.length === 0) return;
    const errors = [];
    const room = Math.max(
      0,
      Math.min(
        IMAGE_RULES.maxFilesPerRequest - this.pending.length,
        IMAGE_RULES.maxImagesPerProperty -
          this.images.length -
          this.pending.length,
      ),
    );

    for (const file of files) {
      if (this.pending.length >= IMAGE_RULES.maxFilesPerRequest || room === 0) {
        errors.push(
          `Limite de imagens atingido (${IMAGE_RULES.maxFilesPerRequest} por envio, ${IMAGE_RULES.maxImagesPerProperty} por imóvel).`,
        );
        break;
      }
      if (
        this.images.length + this.pending.length >=
        IMAGE_RULES.maxImagesPerProperty
      ) {
        errors.push(
          `Cada imóvel aceita no máximo ${IMAGE_RULES.maxImagesPerProperty} imagens.`,
        );
        break;
      }
      const error = await validateImageFileDeep(file);
      if (error) {
        errors.push(error);
        continue;
      }
      this.pending.push({
        key: `p${++this.counter}`,
        file,
        alt: "",
        previewUrl: URL.createObjectURL(file),
      });
    }
    this.fileInput.value = ""; // permite escolher o mesmo arquivo de novo
    this.renderPending();
    if (errors.length > 0)
      this.toast.show([...new Set(errors)].join(" "), "warning");
  },

  renderPending() {
    const doc = this.pendingList.ownerDocument;
    const items = this.pending.map((item) => {
      const card = doc.createElement("article");
      card.className = "pending-item";

      const img = doc.createElement("img");
      img.src = item.previewUrl; // blob: criado pelo próprio navegador
      img.alt = `Prévia de ${item.file.name}`;

      const name = doc.createElement("span");
      name.className = "pending-name";
      name.textContent = `${item.file.name} (${Math.ceil(item.file.size / 1024)} KB)`;

      const alt = doc.createElement("input");
      alt.type = "text";
      alt.placeholder = "Texto alternativo (opcional)";
      alt.maxLength = IMAGE_RULES.maxAltLength;
      alt.value = item.alt;
      alt.dataset.alt = item.key;
      alt.setAttribute("aria-label", `Texto alternativo de ${item.file.name}`);

      const remove = doc.createElement("button");
      remove.type = "button";
      remove.className = "secondary";
      remove.dataset.pending = item.key;
      remove.textContent = "Descartar";

      card.append(img, name, alt, remove);
      return card;
    });
    this.pendingList.replaceChildren(...items);
    this.counterEl.textContent =
      this.pending.length === 0
        ? "Nenhuma imagem selecionada."
        : `${this.pending.length} imagem(ns) selecionada(s) — ainda não enviadas.`;
    this.submitButton.disabled = this.pending.length === 0;
  },

  removePending(key) {
    const index = this.pending.findIndex((p) => p.key === key);
    if (index < 0) return;
    URL.revokeObjectURL(this.pending[index].previewUrl);
    this.pending.splice(index, 1);
    this.renderPending();
  },

  clearPending() {
    for (const item of this.pending) URL.revokeObjectURL(item.previewUrl);
    this.pending.length = 0;
    this.fileInput.value = "";
    this.renderPending();
  },

  async upload() {
    if (this.propertyId === null || !this.editable) {
      this.toast.show(
        "Selecione um imóvel seu para enviar imagens.",
        "warning",
      );
      return;
    }
    if (this.pending.length === 0) {
      this.toast.show("Selecione ao menos uma imagem.", "warning");
      return;
    }
    this.form.setLoading(true, "Enviando…");
    this.pendingList.setAttribute("aria-busy", "true");
    try {
      const response = await this.service.upload(
        this.propertyId,
        this.pending.map((p) => p.file),
        this.pending.map((p) => p.alt.trim()),
      );
      if (!this.toast.fromResponse(response)) return; // o backend rejeitou: nada foi salvo, a seleção continua
      this.clearPending();
      await this.load(); // a lista vem da API, não da memória
    } catch (error) {
      this.toast.fromError(error);
    } finally {
      this.pendingList.removeAttribute("aria-busy");
      this.form.setLoading(false);
      this.submitButton.disabled = this.pending.length === 0;
    }
  },

  async removeImage(image) {
    if (!this.editable) return;
    if (
      !this.confirm(
        `Remover esta imagem do imóvel #${this.propertyId}? As outras imagens serão mantidas.`,
      )
    )
      return;
    try {
      const response = await this.service.remove(this.propertyId, image.id);
      if (!this.toast.fromResponse(response)) return;
      await this.load();
    } catch (error) {
      this.toast.fromError(error);
    }
  },
};

export function createGalleryController({
  form, // FormController do formulário de envio
  select,
  fileInput,
  pendingList,
  counterEl,
  list,
  rules,
  service,
  toast,
  locationBox = null, // opcionais: cabeçalho com a localização do imóvel selecionado
  locationText = null,
  locationMeta = null,
  canEdit = () => false,
  confirm = (message) => window.confirm(message),
}) {
  return Object.create(GalleryControllerPrototype, {
    form: { value: form },
    select: { value: select },
    fileInput: { value: fileInput },
    pendingList: { value: pendingList },
    counterEl: { value: counterEl },
    list: { value: list },
    rules: { value: rules },
    service: { value: service },
    toast: { value: toast },
    locationBox: { value: locationBox },
    locationText: { value: locationText },
    locationMeta: { value: locationMeta },
    canEdit: { value: canEdit },
    confirm: { value: confirm },
    submitButton: { value: form.form.querySelector('button[type="submit"]') },
    properties: { value: [], writable: true },
    propertyId: { value: null, writable: true },
    initialId: { value: null, writable: true },
    editable: { value: false, writable: true },
    images: { value: [], writable: true },
    pending: { value: [] },
    counter: { value: 0, writable: true },
  });
}
