import HttpClientBase from "../HttpClientBase.js";
import SessionStorage from "../../scripts/storage.js";
import User from "../entities/User.js";
import { safeUploadUrl } from "../../scripts/image-rules.js";

export default class UserService extends HttpClientBase {
  constructor({ storage = new SessionStorage(), ...options } = {}) {
    super({ tokenProvider: () => storage.getToken(), ...options });
  }

  #toUser(response) {
    return response.type === "success" && response.data
      ? { ...response, data: User.fromApi(response.data) }
      : response;
  }

  async register(user) {
    return this.#toUser(
      await this.post("/users/register", user.toRegisterPayload()),
    );
  }

  async login(user) {
    return this.#toUser(await this.post("/users/login", user.toLoginPayload()));
  }

  /** GET /users/me — perfil do usuário do token, com a URL da foto atual. */
  async me() {
    const response = await this.get("/users/me");
    if (response.type !== "success" || !response.data) return response;
    const user = User.fromApi(response.data);
    user.photo = safeUploadUrl(response.data.photo, this.baseUrl);
    return { ...response, data: user };
  }

  /**
   * POST /users/photo — multipart, campo "photo". O usuário alterado é o do token
   * (o corpo nunca carrega id de usuário).
   */
  async uploadPhoto(file) {
    const form = new FormData();
    form.append("photo", file);
    const response = await this.postForm("/users/photo", form);
    if (response.type !== "success" || !response.data) return response;
    return {
      ...response,
      data: { photo: safeUploadUrl(response.data.photo, this.baseUrl) },
    };
  }

  async updateProfile(user) {
    return this.#toUser(
      await this.put("/users/update", user.toProfilePayload()),
    );
  }
}
