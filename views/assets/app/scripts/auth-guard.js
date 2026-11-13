import SessionStorage from "../../_common/scripts/storage.js";
import User from "../../_common/classes/entities/User.js";

const LOGIN_URL = "../public/login.html";
const storage = new SessionStorage();

function logout() {
  storage.clearSession();
  window.location.href = LOGIN_URL;
}

if (!storage.isAuthenticated()) {
  window.location.href = LOGIN_URL;
} else {
  const expectedType = document.body.classList.contains("app-tenant")
    ? User.TYPES.TENANT
    : document.body.classList.contains("app-owner")
      ? User.TYPES.OWNER
      : null;
  const user = User.fromSession(storage.getUser());

  if (expectedType && user?.userType && user.userType !== expectedType) {
    window.location.replace(user.homePath());
  } else {
    window.sgdiLogout = logout;

    const bind = () => {
      const nameEl = document.getElementById("user-display-name");
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
}
