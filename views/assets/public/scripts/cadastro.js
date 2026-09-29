async function Register () {
  const URL_REGISTER = "http://localhost/SGDI/api/users/register";
  const form = document.getElementById("signup-form");

  if (!form) return;

  function mapTypeUser(value) 
  {
    const map = {
      inquilino: "1",
      proprietario: "2",
    };
    return map[value] ?? null;
  }

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

  function setLoading(isLoading) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Criando conta..." : "Criar Conta";
  }

  form.addEventListener("submit", async (e) => 
  {
    e.preventDefault();

    const name = form.querySelector("#nome").value;
    const email = form.querySelector("#email-signup").value.trim();
    const typeRaw = form.querySelector("#tipo").value;
    const password = form.querySelector("#senha-signup").value;

    if (!name || !email || !typeRaw || !password) 
    {
      showFeedback("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
    {
      showFeedback("Informe um e-mail válido.");
      return;
    }

    if (password.length < 6) 
    {
      showFeedback("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const type_user = mapTypeUser(typeRaw);
    if (!type_user) 
    {
      showFeedback("Selecione um tipo de usuário válido.");
      return;
    }

    setLoading(true);

    try {
      const body = new URLSearchParams({
        name,
        email,
        password,
        type_user,
      });

      const response = await fetch(URL_REGISTER, {
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
        result.status === "bad_request" ||
        result.status === "internal_server_error"
      ) {
        showFeedback(
          result?.message ||
            "Não foi possível realizar o cadastro. Tente novamente.",
          "error",
        );
        return;
      }

      showFeedback(
        result.message || "Usuário cadastrado com sucesso!",
        "success",
      );

      sessionStorage.setItem("sgdi_pending_type", type_user);
      if (result.data) 
      {
        sessionStorage.setItem(
          "sgdi_pending_user",
          JSON.stringify({
            id_user: result.data.id_user,
            name: result.data.name,
            email: result.data.email,
            type_user: result.data.type_user ?? Number(type_user),
          }),
        );
      }

    setTimeout(() => 
    {
      window.location.href = "login.html";
    }, 5000);
    } catch (err) 
    {
      console.error("Erro de rede no cadastro:", err);
      showFeedback("Serviço indisponível. Verifique se a API está rodando.");
    } finally 
    {
      setLoading(false);
    }
  });
};
Register();