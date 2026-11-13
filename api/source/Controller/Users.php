<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Support\Upload;

class Users extends Api
{
    public function register(array $data): void
    {
        if (
            !isset($data["password"]) ||
            empty($data["password"]) ||
            !$this->validateNameEmail($data) ||
            !isset($data["type_user"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Dados inválidos.",
                "error",
            )->back();
            return;
        }

        $user = new User(
            null,
            $data["type_user"],
            $data["name"],
            $data["email"],
            $data["password"],
        );

        if (!$user->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            201,
            "success",
            "Usuário cadastrado com sucesso.",
            "success",
        )->back([
            "id_user" => $user->getIdUser(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "type_user" => $user->getIdUserType(),
        ]);
    }

    public function registerAdmin(array $data): void
    {
        $data["type_user"] = 3;

        $this->register($data);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(2)) {
            if (!$this->authToken(1)) {
                $this->call(
                    401,
                    "unauthorized",
                    "Token de autenticação inválido ou expirado.",
                    "error",
                )->back();
                return;
            }
        }
        if (
            !$this->validateNameEmail($data) ||
            !isset($data["password"]) ||
            empty($data["password"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Dados inválidos.",
                "error",
            )->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Usuário não encontrado.",
                "error",
            )->back();
            return;
        }

        $user->setName($data["name"]);
        $user->setEmail($data["email"]);
        $user->setPassword(password_hash($data["password"], PASSWORD_DEFAULT));

        if (!$user->updateById($this->userAuthId)) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Usuário atualizado com sucesso.",
            "success",
        )->back([
            "id_user" => $this->userAuthId,
            "name" => $user->getName(),
            "email" => $user->getEmail(),
        ]);
    }

    public function updateAdmin(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(
                401,
                "unauthorized",
                "Token inválido.",
                "error",
            )->back();
            return;
        }

        if (
            !$this->validateNameEmail($data) ||
            !isset($data["password"]) ||
            empty($data["password"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Dados inválidos.",
                "error",
            )->back();
            return;
        }

        $user = new User();

        if (!$user->selectById($this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Administrador não encontrado.",
                "error",
            )->back();
            return;
        }

        $user->setName($data["name"]);
        $user->setEmail($data["email"]);
        $user->setPassword(password_hash($data["password"], PASSWORD_DEFAULT));

        if (!$user->updateById($this->userAuthId)) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Administrador atualizado com sucesso.",
            "success",
        )->back([
            "id_user" => $this->userAuthId,
            "name" => $user->getName(),
            "email" => $user->getEmail(),
        ]);
    }

    public function auth(array $data): void
    {
        // $data = json_decode(file_get_contents("php://input"), true);
        if (
            !isset($data["email"], $data["password"]) ||
            empty($data["email"]) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error",
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data["email"], $data["password"])) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_user" => $user->getIdUser(),
            "name" => $user->getName(),
            "token" => $user->getToken(),
            "type_user" => $user->getIdUserType(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success",
        )->back($response);
    }

    public function authAdmin(array $data): void
    {
        if (
            !isset($data["email"], $data["password"]) ||
            empty($data["email"]) ||
            empty($data["password"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error",
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data["email"], $data["password"])) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_user" => $user->getIdUser(),
            "name" => $user->getName(),
            "token" => $user->getToken(),
            "type_user" => $user->getIdUserType(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success",
        )->back($response);
    }


    
   
    /**
     * GET /users/me — dados do usuário autenticado (a identidade vem do token) e URL da foto atual.
     */
    public function me(array $data): void
    {
        if (!$this->authToken(2) && !$this->authToken(1)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil do usuário autenticado", "success")->back([
            "id_user" => $user->getIdUser(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "type_user" => $user->getIdUserType(),
            "photo" => $this->photoUrl($user->getPhoto()),
        ]);
    }

    public function listTenants(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }

        $user = new User();
        $tenants = $user->listTenants();
        if ($tenants === null) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage() ?? "Não foi possível carregar os inquilinos.",
                "error",
            )->back();
            return;
        }

        $this->call(200, "success", "Lista de inquilinos", "success")->back($tenants);
    }

    /**
     * POST /users/photo — multipart/form-data, campo "photo". Qualquer perfil autenticado (Inquilino ou Proprietário);
     * o usuário alterado é SEMPRE o do token, nunca um id enviado pelo formulário.
     */
    public function uploadPhoto (array $data): void
    {
        if (!$this->authToken(2) && !$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        // post_max_size excedido: o PHP descarta $_POST e $_FILES sem erro
        if (empty($_FILES) && (int) ($_SERVER["CONTENT_LENGTH"] ?? 0) > 0) {
            $this->call(413, "payload_too_large", "O envio excede o limite de " . ini_get("post_max_size") . " aceito pelo servidor (post_max_size).", "error")->back();
            return;
        }

        if (!isset($_FILES["photo"]) || !is_array($_FILES["photo"])) {
            $this->call(400, "bad_request", "Selecione uma imagem para enviar.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }
        $oldPhoto = $user->getPhoto();

        $uploadDirectory = uploads_path("users"); // api/uploads/users (servido por url("uploads/users/..."))
        $uploader = new Upload($uploadDirectory);
        try {
            $filename = $uploader->image($_FILES["photo"]);
        } catch (\RuntimeException $exception) {
            $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
            return;
        }

        $photoPath = "uploads/users/" . $filename;
        $photoUrl = $this->photoUrl($photoPath);
        if (!$user->updatePhoto($this->userAuthId, $photoPath)) {
            $savedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover a foto enviada após falha ao atualizar o perfil.");
            }
            $this->call(500, "internal_server_error", $user->getErrorMessage() ?? "Não foi possível atualizar a foto.", "error")->back();
            return;
        }

        $this->deletePreviousPhoto($oldPhoto, $uploadDirectory);

        $this->call(200, "success", "Foto atualizada com sucesso.", "success")->back([
            "photo" => $photoUrl,
        ]);
    }

    private function photoUrl(?string $photoPath): ?string
    {
        if ($photoPath === null || trim($photoPath) === "") {
            return null;
        }

        if (filter_var($photoPath, FILTER_VALIDATE_URL)) {
            return $photoPath;
        }

        return url(ltrim($photoPath, "/"));
    }

    private function deletePreviousPhoto(?string $photoUrl, string $uploadDirectory): void
    {
        if ($photoUrl === null || $photoUrl === "") {
            return;
        }

        $photoPath = parse_url($photoUrl, PHP_URL_PATH);
        $uploadsUrlPath = parse_url(url("uploads/users/"), PHP_URL_PATH);
        if (!is_string($photoPath) || !is_string($uploadsUrlPath)) {
            return;
        }

        $normalizedPath = ltrim($photoPath, "/");
        $managedPrefixes = ["uploads/users/", ltrim(rtrim($uploadsUrlPath, "/") . "/", "/")];
        $filename = null;
        foreach ($managedPrefixes as $managedPrefix) {
            if ($managedPrefix !== "" && str_starts_with($normalizedPath, $managedPrefix)) {
                $candidate = substr($normalizedPath, strlen($managedPrefix));
                if (preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $candidate)) {
                    $filename = $candidate;
                    break;
                }
            }
        }

        if ($filename === null) {
            return;
        }

        $oldFilePath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
        if (is_file($oldFilePath) && !unlink($oldFilePath)) {
            error_log("Não foi possível remover a foto antiga do perfil.");
        }
    }





    // Valida somente Nome e Email, mas pode ser alterada para validar mais campos
    private function validateNameEmail(array $data): bool
    {
        if (
            !isset($data["name"], $data["email"]) ||
            empty($data["name"]) ||
            empty($data["email"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)
        ) {
            return false;
        }
        return true;
    }
}
