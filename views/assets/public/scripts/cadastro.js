import User from "../../_common/classes/entities/User.js";
import UserService from "../../_common/classes/services/UserService.js";
import { createToast } from "../../_common/prototypes/Toast.js";
import { createFormController } from "../../_common/prototypes/FormController.js";

const REDIRECT_DELAY_MS = 5000; 
const TYPE_BY_OPTION = {
  inquilino: User.TYPES.TENANT,
  proprietario: User.TYPES.OWNER,
};

const formElement = document.getElementById("signup-form");

if (formElement) {
  const service = new UserService();
  const toast = createToast({
    container: formElement,
    inline: true,
    duration: 0,
  });
  const form = createFormController(formElement);

  form.onSubmit(async (values) => {
    const userType = TYPE_BY_OPTION[values.type_user] ?? null;
    if (
      !values.name ||
      !values.email ||
      !values.type_user ||
      !values.password
    ) {
      toast.show("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    let user;
    try {
      user = new User({
        name: values.name,
        email: values.email,
        password: values.password,
        userType,
      });
      if (userType === null)
        throw new TypeError("Selecione um tipo de usuário válido.");
    } catch (error) {
      toast.fromError(error);
      return;
    }

    form.setLoading(true, "Criando conta...");
    try {
      const response = await service.register(user);
      if (response.type !== "success") {
        toast.show(
          response.message ||
            "Não foi possível realizar o cadastro. Tente novamente.",
          "error",
        );
        return;
      }

      toast.show(
        response.message || "Usuário cadastrado com sucesso!",
        "success",
      );
      sessionStorage.setItem("sgdi_pending_type", String(userType));
      if (response.data)
        sessionStorage.setItem(
          "sgdi_pending_user",
          JSON.stringify(response.data.toJSON()),
        );
      setTimeout(
        () => (window.location.href = "login.html"),
        REDIRECT_DELAY_MS,
      );
    } catch (error) {
      toast.fromError(error);
    } finally {
      form.setLoading(false);
    }
  });
}
