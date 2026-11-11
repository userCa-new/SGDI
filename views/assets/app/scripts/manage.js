import SessionStorage from "../../_common/scripts/storage.js";
import User from "../../_common/classes/entities/User.js";
import Property from "../../_common/classes/entities/Property.js";
import Contract from "../../_common/classes/entities/Contract.js";
import Appointment from "../../_common/classes/entities/Appointment.js";
import PropertyService from "../../_common/classes/services/PropertyService.js";
import ContractService from "../../_common/classes/services/ContractService.js";
import AppointmentService from "../../_common/classes/services/AppointmentService.js";
import UserService from "../../_common/classes/services/UserService.js";
import PropertyImageService from "../../_common/classes/services/PropertyImageService.js";
import { IMAGE_RULES } from "../../_common/scripts/image-rules.js";
import { createPhotoController } from "../../_common/prototypes/PhotoController.js";
import { createGalleryController } from "../../_common/prototypes/GalleryController.js";
import { createToast } from "../../_common/prototypes/Toast.js";
import { createFormController } from "../../_common/prototypes/FormController.js";
import { createCrudController } from "../../_common/prototypes/CrudController.js";

const storage = new SessionStorage();
const sessionUser = User.fromSession(storage.getUser());
const $ = (selector) => document.querySelector(selector);

const pageToast = createToast();
const profileToast = createToast({
  container: $("#profile-section"),
  inline: true,
});

const isOwner = Boolean(sessionUser?.isOwner());
const isTenant = Boolean(sessionUser?.isTenant());
$("#role-hint").textContent = isOwner
  ? "Perfil Proprietário: cria, edita e exclui imóveis e contratos; conclui atendimentos."
  : isTenant
    ? "Perfil Inquilino: agenda e exclui atendimentos; imóveis e contratos ficam somente para consulta."
    : "Seu perfil não tem operações de escrita nestas rotas.";

const formatMoney = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const yesNo = (value) => (value ? "Sim" : "Não");
const formatDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

/* ---------- Imóveis ---------- */
const propertyCrud = createCrudController({
  label: "imóvel",
  service: new PropertyService(),
  form: createFormController($("#property-form")),
  toast: pageToast,
  listElement: $("#property-list"),
  permissions: { create: isOwner, update: isOwner, remove: isOwner },
  rowActions: [
    { name: "edit", label: "Editar", permission: "update" },
    { name: "delete", label: "Excluir", permission: "remove" },
    {
      name: "gallery",
      label: "Galeria",
      run: (property) => {
        gallery.selectProperty(property.id);
        $("#gallery-section").scrollIntoView({ behavior: "smooth" });
      },
    },
  ],
  onLoad: (items) => gallery.setProperties(items), // a galeria usa a lista de imóveis carregada
  columns: [
    { label: "ID", value: (p) => p.id },
    { label: "Localização", value: (p) => p.location },
    { label: "Quartos", value: (p) => p.numberOfRooms },
    { label: "Disponível", value: (p) => yesNo(p.isAvailable()) },
    { label: "Em atraso", value: (p) => yesNo(p.hasLatePayment()) },
  ],
  buildEntity: (v) =>
    new Property({
      location: v.location,
      numberOfRooms: v.numberOfRooms,
      availability: v.availability,
      latePayment: v.latePayment,
    }),
  toFormValues: (p) => ({
    location: p.location,
    numberOfRooms: p.numberOfRooms,
    availability: p.availability,
    latePayment: p.latePayment,
  }),
});

/* ---------- Contratos ---------- */
const contractCrud = createCrudController({
  label: "contrato",
  service: new ContractService(),
  form: createFormController($("#contract-form")),
  toast: pageToast,
  listElement: $("#contract-list"),
  permissions: { create: isOwner, update: isOwner, remove: isOwner },
  columns: [
    { label: "ID", value: (c) => c.id },
    { label: "Imóvel", value: (c) => c.idProperty },
    { label: "Aluguel", value: (c) => formatMoney(c.rentValue) },
    { label: "Início", value: (c) => formatDate(c.startDate) },
    { label: "Fim", value: (c) => formatDate(c.endDate) },
    { label: "Status", value: (c) => Contract.STATUS_LABEL[c.status] },
  ],
  buildEntity: (v) =>
    new Contract({
      idProperty: v.idProperty,
      rentValue: v.rentValue,
      startDate: v.startDate,
      endDate: v.endDate,
      status: v.status,
    }),
  toFormValues: (c) => ({
    idProperty: c.idProperty,
    rentValue: c.rentValue,
    startDate: c.startDate,
    endDate: c.endDate ?? "",
    status: c.status,
  }),
});

/* ---------- Atendimentos ---------- */
const appointmentService = new AppointmentService();
const appointmentCrud = createCrudController({
  label: "atendimento",
  service: appointmentService,
  form: createFormController($("#appointment-form")),
  toast: pageToast,
  listElement: $("#appointment-list"),
  permissions: { create: isTenant, update: isOwner, remove: isTenant },
  columns: [
    { label: "ID", value: (a) => a.id },
    { label: "Imóvel", value: (a) => a.idProperty },
    { label: "Data", value: (a) => formatDate(a.date) },
    { label: "Observação", value: (a) => a.observation },
    { label: "Concluído", value: (a) => yesNo(a.isCompleted()) },
  ],
  rowActions: [
    {
      name: "toggle",
      label: (a) => (a.isCompleted() ? "Reabrir" : "Concluir"),
      permission: "update",
      run: async (appointment, crud) => {
        appointment.isCompleted()
          ? appointment.reopen()
          : appointment.markCompleted();
        try {
          const response = await appointmentService.update(appointment);
          crud.toast.fromResponse(response);
        } catch (error) {
          crud.toast.fromError(error);
        }
        await crud.load();
      },
    },
    { name: "delete", label: "Excluir", permission: "remove" },
  ],
  buildEntity: (v) =>
    new Appointment({
      idProperty: v.idProperty,
      date: v.date,
      observation: v.observation,
      completed: v.completed,
    }),
  toFormValues: (a) => ({
    idProperty: a.idProperty,
    date: a.date,
    observation: a.observation,
    completed: a.completed,
  }),
});

/* ---------- Perfil ---------- */
const userService = new UserService();
const profileForm = createFormController($("#profile-form"));
profileForm.fill({
  name: sessionUser?.name ?? "",
  email: sessionUser?.email ?? "",
});
profileForm.onSubmit(async (values, errors) => {
  if (errors.length > 0) return profileToast.show(errors.join(" "), "warning");
  try {
    const user = new User({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    profileForm.setLoading(true, "Atualizando...");
    const response = await userService.updateProfile(user);
    if (profileToast.fromResponse(response)) {
      storage.updateUser({ name: user.name, email: user.email });
      $("#user-display-name").textContent = user.name;
      profileForm.fill({ password: "" }); // senha nunca fica no formulário
    }
  } catch (error) {
    profileToast.fromError(error);
  } finally {
    profileForm.setLoading(false);
  }
});

/* ---------- Foto do perfil (Parte A) ---------- */
$("#photo-rules").textContent = IMAGE_RULES.description;
$("#photo-fallback").textContent = (sessionUser?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
const photoController = createPhotoController({
  form: createFormController($("#photo-form")),
  input: $("#photo-input"),
  preview: $("#photo-preview"),
  previewBox: $("#photo-preview-box"),
  current: $("#photo-current"),
  fallback: $("#photo-fallback"),
  service: userService,
  toast: profileToast,
});
photoController.init();

/* ---------- Galeria de imagens do imóvel (Parte B) ---------- */
const gallery = createGalleryController({
  form: createFormController($("#gallery-form")),
  select: $("#gallery-property"),
  fileInput: $("#gallery-files"),
  pendingList: $("#gallery-pending"),
  counterEl: $("#gallery-counter"),
  list: $("#gallery-list"),
  rules: $("#gallery-rules"),
  service: new PropertyImageService(),
  toast: pageToast,
  // só o Proprietário DONO do imóvel vê o formulário de envio e o botão remover (o backend valida de verdade)
  canEdit: (property) => isOwner && property.idOwner === sessionUser?.id,
});
gallery.init();

try {
  // foto atual vem do backend (GET /users/me): persiste ao atualizar a página
  const me = await userService.me();
  if (me.type === "success") photoController.showCurrent(me.data.photo);
  else profileToast.fromResponse(me);
} catch (error) {
  profileToast.fromError(error);
}

await Promise.all([
  propertyCrud.init(),
  contractCrud.init(),
  appointmentCrud.init(),
]);

/* ---------- Evidência de protótipos: objetos distintos, métodos compartilhados ---------- */
const same = (a, b) => Object.getPrototypeOf(a) === Object.getPrototypeOf(b);
$("#proto-proof").textContent = [
  `pageToast !== profileToast ............. ${pageToast !== profileToast}`,
  `mesmo protótipo (Toast) ................ ${same(pageToast, profileToast)}`,
  `pageToast.show === profileToast.show ... ${pageToast.show === profileToast.show}`,
  `show NÃO é propriedade própria do objeto  ${!Object.hasOwn(pageToast, "show")}  (método vive só no protótipo)`,
  `mesmo protótipo (CrudController) ....... ${same(propertyCrud, contractCrud) && same(contractCrud, appointmentCrud)}`,
  `propertyCrud.save === contractCrud.save  ${propertyCrud.save === contractCrud.save}`,
  `mesmo protótipo (FormController) ....... ${same(propertyCrud.form, contractCrud.form) && same(contractCrud.form, profileForm)}`,
  `upload/addFiles só existem no protótipo .. ${!Object.hasOwn(gallery, "upload") && !Object.hasOwn(gallery, "addFiles") && !Object.hasOwn(photoController, "upload")}`,
].join("\n");
