import SessionStorage from "../../_common/scripts/storage.js";
import User from "../../_common/classes/entities/User.js";
import UserService from "../../_common/classes/services/UserService.js";
import { createToast } from "../../_common/prototypes/Toast.js";
import { createFormController } from "../../_common/prototypes/FormController.js";

const REDIRECT_DELAY_MS = 5000; // mesmo atraso da Etapa 05

const formElement = document.getElementById("login-form");

if (formElement) {
    const storage = new SessionStorage();
    const service = new UserService({ storage });
    const toast = createToast({ container: formElement, inline: true, duration: 0 });
    const form = createFormController(formElement);

    // já autenticado: segue para a tela do perfil, como antes
    const stored = User.fromSession(storage.getUser());
    if (storage.isAuthenticated() && stored?.userType) {
        window.location.href = stored.homePath();
    }

    form.onSubmit(async (values) => {
        let credentials;
        try {
            credentials = new User({ email: values.email, password: values.senha });
        } catch (error) {
            toast.show(error.message.includes("senha") ? "Preencha e-mail e senha." : error.message, "warning");
            return;
        }

        form.setLoading(true, "Entrando...");
        try {
            const response = await service.login(credentials);
            if (response.type !== "success") {
                toast.show(response.message || "Credenciais inválidas ou serviço indisponível.", "error");
                return;
            }

            const user = response.data; // User devolvido pelo serviço
            if (!user?.token) {
                toast.show("O servidor não retornou uma sessão válida.", "error");
                return;
            }

            // perfil pendente vindo do cadastro, se a API não informar o tipo
            const pendingType = sessionStorage.getItem("sgdi_pending_type");
            user.userType = user.userType ?? (pendingType ? Number(pendingType) : (storage.getUser()?.type_user ?? null));

            // e-mail vem do formulário (a API não o devolve no login); senha nunca é salva
            storage.saveSession(user.token, { ...user.toJSON(), email: credentials.email });
            sessionStorage.removeItem("sgdi_pending_type");
            sessionStorage.removeItem("sgdi_pending_user");

            toast.show(response.message || "Login realizado com sucesso!", "success");
            setTimeout(() => (window.location.href = user.homePath()), REDIRECT_DELAY_MS);
        } catch (error) {
            toast.fromError(error);
        } finally {
            form.setLoading(false);
        }
    });
}
