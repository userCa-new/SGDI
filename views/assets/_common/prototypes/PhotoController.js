import { IMAGE_RULES, validateImageFileDeep } from "../scripts/image-rules.js";

/**
 * PhotoController — seletor, prévia e envio da foto do perfil (POO prototípica).
 *
 * COMPARTILHADO no protótipo: init, select, clearSelection, showCurrent, upload.
 * PRÓPRIO de cada objeto: elementos, serviço, toast, arquivo escolhido e URL da prévia.
 *
 * O envio usa service.uploadPhoto(file) (FormData, campo "photo"); a identidade
 * do usuário vem do token no backend — nenhum id é enviado.
 */
export const PhotoControllerPrototype = {
  init() {
    this.input.accept = IMAGE_RULES.accept;
    this.input.addEventListener("change", () => this.select(this.input.files?.[0] ?? null));
    this.form.form
      .querySelector("[data-action='cancel']")
      ?.addEventListener("click", () => this.clearSelection());
    this.current.addEventListener("error", () => this.showCurrent(null)); // URL quebrada: volta ao ícone
    this.form.onSubmit(() => this.upload());
    this.clearSelection();
  },

  /** Valida o arquivo escolhido e mostra a prévia ANTES do envio. */
  async select(file) {
    if (!file) {
      this.clearSelection();
      return;
    }
    const error = await validateImageFileDeep(file);
    if (error) {
      this.clearSelection();
      this.toast.show(error, "warning");
      return;
    }
    this.revokePreview();
    this.file = file;
    this.previewUrl = URL.createObjectURL(file);
    this.preview.src = this.previewUrl;
    this.previewBox.hidden = false;
    this.submitButton.disabled = false;
  },

  revokePreview() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  },

  clearSelection() {
    this.revokePreview();
    this.file = null;
    this.input.value = "";
    this.preview.removeAttribute("src");
    this.previewBox.hidden = true;
    this.submitButton.disabled = true;
  },

  /** Mostra a foto atual (URL já verificada pelo serviço) ou o ícone de reserva. */
  showCurrent(url) {
    const has = typeof url === "string" && url !== "";
    if (has) this.current.src = url;
    else this.current.removeAttribute("src");
    this.current.hidden = !has;
    this.fallback.hidden = has;
  },

  async upload() {
    if (!this.file) {
      this.toast.show("Selecione uma imagem para enviar.", "warning");
      return;
    }
    this.form.setLoading(true, "Enviando...");
    try {
      const response = await this.service.uploadPhoto(this.file);
      if (!this.toast.fromResponse(response)) return; // erro do backend: mantém a seleção
      this.showCurrent(response.data.photo);
      this.clearSelection();
    } catch (error) {
      this.toast.fromError(error);
    } finally {
      this.form.setLoading(false);
      this.submitButton.disabled = this.file === null;
    }
  },
};

export function createPhotoController({
  form, // FormController do <form> da foto
  input,
  preview,
  previewBox,
  current,
  fallback,
  service,
  toast,
}) {
  return Object.create(PhotoControllerPrototype, {
    form: { value: form },
    input: { value: input },
    preview: { value: preview },
    previewBox: { value: previewBox },
    current: { value: current },
    fallback: { value: fallback },
    service: { value: service },
    toast: { value: toast },
    submitButton: { value: form.form.querySelector('button[type="submit"]') },
    file: { value: null, writable: true },
    previewUrl: { value: null, writable: true },
  });
}
