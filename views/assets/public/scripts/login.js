async function Login () {
  const URL_LOGIN = "http://localhost/SGDI/api/users/login";
  const form = document.getElementById("login-form");

  if (!form) return;

  const TOKEN_KEY = "token";
  const USER_KEY = "sgdi_user";

  function showFeedback(message, type = "error") 
  {
    const old = form.querySelector(".feedback");
    if (old) old.remove();

    const el = document.createElement("p");
    el.className = `feedback feedback-${type}`;
    el.textContent = message;
    el.setAttribute("role", "alert");
    form.appendChild(el);
  }

  function setLoading(isLoading) 
  {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Entrando..." : "Entrar";
  }

  function saveSession(token, user) 
  {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  function getStoredUser() 
  {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function redirectByType(typeUser) 
  {
    const type = Number(typeUser);
    if (type === 1) {
      window.location.href = "../app/tenant.html";
    } else if (type === 2) {
      window.location.href = "../app/owner.html";
    } else {
      window.location.href = "../app/index.html";
    }
  }

  form.addEventListener("submit", async (e) => 
  {
    e.preventDefault();

    const email = form.querySelector("#email").value;
    const password = form.querySelector("#senha").value;

    if (!email || !password) {
      showFeedback("Preencha e-mail e senha.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams({ email, password });

      const response = await fetch(URL_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      });

      const result = await response.json().catch(() => null);

      console.log(result);
      if (
        !response.ok ||
        !result ||
        result.type === "error" ||
        result.status === "error" ||
        result.status === "unauthorized" ||
        result.status === "bad_request"
      ) {
        showFeedback(
          result?.message || "Credenciais inválidas ou serviço indisponível.",
          "error",
        );
        return;
      }

      const token = result.data?.token;
      if (!token) {
        showFeedback("O servidor não retornou uma sessão válida.", "error");
        return;
      }

      const pendingType = sessionStorage.getItem("sgdi_pending_type");
      const pendingUserRaw = sessionStorage.getItem("sgdi_pending_user");
      let pendingUser = null;
      try {
        pendingUser = pendingUserRaw ? JSON.parse(pendingUserRaw) : null;
      } catch {
        pendingUser = null;
      }

      const type_user =
        result.data?.type_user ??
        (pendingType ? Number(pendingType) : null) ??
        pendingUser?.type_user ??
        getStoredUser()?.type_user ??
        null;

      const userData = {
        id_user: result.data.id_user,
        name: result.data.name,
        email: email,
        type_user: type_user,
      };

      saveSession(token, userData);

      sessionStorage.removeItem("sgdi_pending_type");
      sessionStorage.removeItem("sgdi_pending_user");

      showFeedback(result.message || "Login realizado com sucesso!", "success");

      setTimeout(() => {
        redirectByType(type_user);
      }, 5000);
      
    } catch (err) {
      console.error("Erro de rede no login:", err);
      showFeedback("Serviço indisponível. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  });

  if (localStorage.getItem(TOKEN_KEY)) 
  {
    const user = getStoredUser();
    if (user?.type_user) {
      redirectByType(user.type_user);
    }
  }
};
Login();