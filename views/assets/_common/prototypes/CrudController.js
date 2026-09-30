/**
 * CrudController — listar, editar, salvar e excluir com confirmação (POO prototípica).
 *
 * É a COMPOSIÇÃO das demais peças: service (HTTP), form (FormController),
 * toast (Toast) e uma configuração de colunas. Ele não conhece fetch nem regras
 * de negócio; só coordena.
 *
 * COMPARTILHADO no protótipo: init, load, render, edit, save, remove, cancelEdit,
 * can, showState. PRÓPRIO de cada objeto: a configuração e o estado (items, editing).
 *
 * Configuração:
 *  label            nome da entidade ("imóvel")
 *  service          objeto com list/create/update/remove
 *  form             FormController
 *  toast            Toast
 *  listElement      onde a tabela/estado é desenhado
 *  columns          [{ label, value(entity) }]
 *  buildEntity      (valores do formulário) => Entity  (pode lançar TypeError/RangeError)
 *  toFormValues     (entity) => valores para preencher o formulário
 *  permissions      { create, update, remove } — apenas conveniência de UI; o backend valida de verdade
 *  rowActions       [{ name, label|fn, permission, run?(entity, controller) }] (padrão: editar/excluir)
 */
const DEFAULT_ACTIONS = [
    { name: "edit", label: "Editar", permission: "update" },
    { name: "delete", label: "Excluir", permission: "remove" },
];

export const CrudControllerPrototype = {
    init() {
        this.form.onSubmit((values, errors) => this.save(values, errors));
        this.form.form.querySelector("[data-action='cancel']")?.addEventListener("click", () => this.cancelEdit());

        // delegação de eventos: nenhum onclick no HTML
        this.listElement.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;
            const id = Number(button.dataset.id);
            const entity = this.items.find((item) => item.id === id);
            if (entity) this.runAction(button.dataset.action, entity);
        });

        // sem permissão de criar/editar o formulário não faz sentido (o servidor continua sendo a barreira real)
        if (!this.can("create")) {
            this.form.form.hidden = true;
        }
        return this.load();
    },

    can(permission) {
        return this.permissions[permission] !== false;
    },

    runAction(name, entity) {
        const action = this.rowActions.find((item) => item.name === name);
        if (action?.run) return action.run(entity, this);
        if (name === "edit") return this.edit(entity);
        if (name === "delete") return this.remove(entity);
    },

    /** Estados de tela: loading | empty | error */
    showState(kind, message) {
        const doc = this.listElement.ownerDocument;
        const p = doc.createElement("p");
        p.className = `crud-state crud-state--${kind}`;
        p.setAttribute("role", kind === "error" ? "alert" : "status");
        p.textContent = message;
        this.listElement.replaceChildren(p);
    },

    async load() {
        this.showState("loading", `Carregando ${this.label}...`);
        try {
            const response = await this.service.list();
            if (response.type !== "success") {
                this.items = [];
                this.showState("error", response.message || `Não foi possível carregar ${this.label}.`);
                this.toast.fromResponse(response);
                return;
            }
            this.items = response.data;
            this.render();
        } catch (error) {
            this.items = [];
            this.showState("error", error.message);
            this.toast.fromError(error);
        }
    },

    render() {
        if (this.items.length === 0) {
            this.showState("empty", `Nenhum registro de ${this.label} encontrado.`);
            return;
        }
        const doc = this.listElement.ownerDocument;
        const table = doc.createElement("table");
        table.className = "crud-table";

        const head = table.createTHead().insertRow();
        for (const column of [...this.columns, { label: "Ações" }]) {
            const th = doc.createElement("th");
            th.textContent = column.label;
            head.appendChild(th);
        }

        const body = table.createTBody();
        for (const entity of this.items) {
            const row = body.insertRow();
            for (const column of this.columns) row.insertCell().textContent = column.value(entity);

            const cell = row.insertCell();
            for (const action of this.rowActions) {
                if (!this.can(action.permission)) continue;
                const button = doc.createElement("button");
                button.type = "button";
                button.dataset.action = action.name;
                button.dataset.id = String(entity.id);
                button.textContent = typeof action.label === "function" ? action.label(entity) : action.label;
                cell.appendChild(button);
            }
        }
        this.listElement.replaceChildren(table);
    },

    edit(entity) {
        this.editing = entity;
        this.form.fill(this.toFormValues(entity));
        this.form.form.dataset.mode = "edit";
        this.form.form.querySelector("[name]")?.focus?.();
    },

    cancelEdit() {
        this.editing = null;
        this.form.clear();
        delete this.form.form.dataset.mode;
    },

    async save(values, errors = []) {
        let entity;
        try {
            entity = this.buildEntity(values); // setters validam e lançam TypeError/RangeError
            // mensagens da entidade (pt-BR) têm prioridade sobre as nativas do navegador
            const entityErrors = entity.validate();
            if (entityErrors.length > 0) errors = entityErrors;
        } catch (error) {
            this.toast.fromError(error);
            return;
        }
        if (errors.length > 0) {
            this.toast.show([...new Set(errors)].join(" "), "warning");
            return;
        }

        const isUpdate = this.editing !== null;
        const permission = isUpdate ? "update" : "create";
        if (!this.can(permission)) {
            this.toast.show("Seu perfil não tem permissão para esta operação.", "warning");
            return;
        }

        this.form.setLoading(true);
        try {
            if (isUpdate) entity.id = this.editing.id;
            const response = isUpdate ? await this.service.update(entity) : await this.service.create(entity);
            if (!this.toast.fromResponse(response)) return; // erro da API: mantém o formulário preenchido
            this.cancelEdit();
            await this.load();
        } catch (error) {
            this.toast.fromError(error);
        } finally {
            this.form.setLoading(false);
        }
    },

    async remove(entity) {
        if (!this.can("remove")) {
            this.toast.show("Seu perfil não tem permissão para excluir.", "warning");
            return;
        }
        if (!this.confirm(`Excluir este registro de ${this.label} (#${entity.id})? Esta ação não pode ser desfeita.`)) return;
        try {
            const response = await this.service.remove(entity.id);
            if (!this.toast.fromResponse(response)) return;
            if (this.editing?.id === entity.id) this.cancelEdit();
            await this.load();
        } catch (error) {
            this.toast.fromError(error);
        }
    },
};

export function createCrudController(config) {
    const { permissions = {}, rowActions = DEFAULT_ACTIONS, confirm = (message) => window.confirm(message), ...rest } = config;
    return Object.create(CrudControllerPrototype, {
        ...Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, { value, writable: true }])),
        permissions: { value: permissions },
        rowActions: { value: rowActions },
        confirm: { value: confirm },
        items: { value: [], writable: true },
        editing: { value: null, writable: true },
    });
}
