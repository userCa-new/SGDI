import SessionStorage from "../../_common/scripts/storage.js";

const LOGIN_URL = "../public/login.html";
const storage = new SessionStorage();

function logout() {
  storage.clearSession();
  window.location.href = LOGIN_URL;
}

if (!storage.isAuthenticated()) {
  window.location.href = LOGIN_URL;
} else {
  window.sgdiLogout = logout;

  const bind = () => {
    const nameEl = document.getElementById("user-display-name");
    const user = storage.getUser();
    if (nameEl && user?.name) nameEl.textContent = user.name;

    document
      .getElementById("btn-logout")
      ?.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
      });
  };
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", bind)
    : bind();
}
