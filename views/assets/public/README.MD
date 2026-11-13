# 📁 views/assets/public/

## Recursos da Área Pública

---

### 🎯 Para que serve esta pasta?

A pasta `public/` contém os recursos visuais (CSS, JS, imagens) **exclusivos da área pública**
do sistema. Essa é a parte do site que **qualquer visitante** pode acessar, **sem precisar
fazer login**.

---

### 🌐 O que é a área pública?

É a "vitrine" do sistema — as páginas que qualquer pessoa pode ver ao acessar o site:

- 🏠 Página inicial (Home)
- ℹ️ Sobre / Quem Somos
- 📞 Contato
- 🔑 Página de Login
- 📝 Página de Cadastro
- 📄 Termos de uso, Política de privacidade

---

### 📂 Estrutura desta pasta

```
public/
├── images/     ← Imagens da área pública (banners, fotos, ícones)
├── scripts/    ← JavaScript da área pública (formulários, animações)
└── styles/     ← CSS da área pública (layout das páginas, responsividade e redesign.css)
```

---

### 💡 Exemplos de arquivos

| Pasta      | Arquivo exemplo        | Descrição                              |
|------------|------------------------|----------------------------------------|
| `styles/`  | `home.css`             | Estilo da página inicial               |
| `styles/`  | `login.css`            | Estilo da página de login              |
| `styles/`  | `responsive.css`       | Media queries para responsividade      |
| `scripts/` | `login.js`             | Validação e envio do formulário login   |
| `scripts/` | `contact.js`           | Envio do formulário de contato         |
| `images/`  | `banner-home.jpg`      | Banner principal da página inicial     |
| `images/`  | `hero-bg.jpg`          | Imagem de fundo da seção hero          |

---

### 💡 Exemplo: Script de login

```javascript
// public/scripts/login.js

document.getElementById("form-login").addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const response = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const result = await response.json();

    if (result.status === "success") {
        // Salva o token e redireciona para a área logada
        localStorage.setItem("token", result.data.token);
        window.location.href = "app/dashboard.html";
    } else {
        alert(result.message);
    }
});
```

---

### 🎨 Exemplo: CSS responsivo

```css
/* public/styles/responsive.css */

/* Telas menores que 768px (tablets e celulares) */
@media (max-width: 768px) {
    .menu-nav {
        flex-direction: column;
    }

    .hero-title {
        font-size: 1.5rem;
    }
}
```

---

### Sistema visual e funcionamento

As páginas públicas usam os tokens de `../_common/styles/design-system.css` e
`styles/redesign.css`, mantendo os estilos por página como base. O FAQ carrega
as perguntas pela API e apresenta estados de carregamento, vazio e erro. O
formulário de contato está visivelmente desabilitado enquanto não houver um
serviço de envio integrado; não informe endereço, telefone ou e-mail fictícios.
