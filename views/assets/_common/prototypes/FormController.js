export const FormControllerPrototype = {
  serialize() {
    const values = {};
    for (const el of this.form.elements) {
      if (!el.name || el.disabled) continue;
      if (el.type === "checkbox") values[el.name] = el.checked;
      else if (el.type === "radio") {
        if (el.checked) values[el.name] = el.value;
      } else
        values[el.name] = el.type === "password" ? el.value : el.value.trim();
    }
    return values;
  },

  fill(values = {}) {
    for (const el of this.form.elements) {
      if (!el.name || !(el.name in values)) continue;
      const value = values[el.name];
      if (el.type === "checkbox") el.checked = Boolean(value);
      else el.value = value ?? "";
    }
  },

  clear() {
    this.form.reset();
    for (const el of this.form.elements) el.removeAttribute?.("aria-invalid");
  },

  /** @returns {string[]} erros nativos (required, min...) + regras próprias */
  validate() {
    const errors = [];
    const values = this.serialize();
    for (const el of this.form.elements) {
      if (!el.name || el.willValidate === false) continue;
      const invalid = el.checkValidity ? !el.checkValidity() : false;
      el.setAttribute?.("aria-invalid", String(invalid));
      if (invalid)
        errors.push(el.validationMessage || `Campo inválido: ${el.name}`);
    }
    for (const [field, rule] of Object.entries(this.rules)) {
      const message = rule(values[field], values);
      if (message) errors.push(message);
    }
    return errors;
  },

  setLoading(isLoading, loadingLabel = "Salvando...") {
    this.submitting = isLoading;
    for (const button of this.form.querySelectorAll('button[type="submit"]')) {
      if (isLoading) {
        button.dataset.label = button.textContent;
        button.textContent = loadingLabel;
      } else if (button.dataset.label) {
        button.textContent = button.dataset.label;
      }
      button.disabled = isLoading;
    }
    this.form.setAttribute("aria-busy", String(isLoading));
  },

  onSubmit(handler) {
    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (this.submitting) return; // evita envio duplicado
      await handler(this.serialize(), this.validate());
    });
  },
};

export function createFormController(form, rules = {}) {
  if (!form) throw new TypeError("FormController: formulário não encontrado");
  return Object.create(FormControllerPrototype, {
    form: { value: form },
    rules: { value: rules },
    submitting: { value: false, writable: true },
  });
}
