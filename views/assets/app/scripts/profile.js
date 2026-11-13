import SessionStorage from "../../_common/scripts/storage.js";
import User from "../../_common/classes/entities/User.js";
import UserService from "../../_common/classes/services/UserService.js";
import { IMAGE_RULES } from "../../_common/scripts/image-rules.js";
import { createPhotoController } from "../../_common/prototypes/PhotoController.js";
import { createToast } from "../../_common/prototypes/Toast.js";
import { createFormController } from "../../_common/prototypes/FormController.js";


const $ = (selector) => document.querySelector(selector);

const menu = $("#profile-menu");
if (menu) {
  const storage = new SessionStorage();
  const sessionUser = User.fromSession(storage.getUser());
  const userService = new UserService();
  const toast = createToast({ container: $("#profile-section"), inline: true });

  document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      $("#profile-menu > summary")?.focus();
    }
  });

  const profileForm = createFormController($("#profile-form"));
  profileForm.fill({
    name: sessionUser?.name ?? "",
    email: sessionUser?.email ?? "",
  });
  profileForm.onSubmit(async (values, errors) => {
    if (errors.length > 0) return toast.show(errors.join(" "), "warning");
    try {
      const user = new User({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      profileForm.setLoading(true, "Atualizando...");
      const response = await userService.updateProfile(user);
      if (toast.fromResponse(response)) {
        storage.updateUser({ name: user.name, email: user.email });
        $("#user-display-name").textContent = user.name;
        $("#photo-fallback").textContent = initialOf(user.name);
        profileForm.fill({ password: "" }); // a senha nunca fica no formulário
      }
    } catch (error) {
      toast.fromError(error);
    } finally {
      profileForm.setLoading(false);
    }
  });

  const initialOf = (name) => (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  $("#photo-rules").textContent = IMAGE_RULES.description;
  $("#photo-fallback").textContent = initialOf(sessionUser?.name);
  const photoController = createPhotoController({
    form: createFormController($("#photo-form")),
    input: $("#photo-input"),
    preview: $("#photo-preview"),
    previewBox: $("#photo-preview-box"),
    current: $("#photo-current"),
    fallback: $("#photo-fallback"),
    service: userService,
    toast,
  });
  photoController.init();

  try {
    const me = await userService.me();
    if (me.type === "success") photoController.showCurrent(me.data.photo);
    else toast.fromResponse(me);
  } catch (error) {
    toast.fromError(error);
  }
}
