async function auth() {
    const TOKEN_KEY = "token";
    const USER_KEY = "sgdi_user";

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || "null");
        } catch {
            return null;
        }
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    if (!localStorage.getItem(TOKEN_KEY)) {
        window.location.href = "../public/login.html";
        return;
    }

    window.sgdiLogout = function () {
        clearSession();
        window.location.href = "../public/login.html";
    };

    document.addEventListener("DOMContentLoaded", () => {
        const user = getUser();

        const nameEl = document.getElementById("user-display-name");
        if (nameEl && user?.name) {
            nameEl.textContent = user.name;
        }

        const btn = document.getElementById("btn-logout");
        if (btn) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                window.sgdiLogout();
            });
        }
    });
};
auth();
