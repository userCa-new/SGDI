<?php

namespace Source\Controller;

use Source\Models\User;

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
            "error"
        )->back();
        return;
    }

    $user = new User(
        null,
        $data["type_user"],
        $data["name"],
        $data["email"],
        $data["password"]
    );

    if (!$user->insert()) {
        $this->call(
            500,
            "internal_server_error",
            $user->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        201,
        "success",
        "Usuário cadastrado com sucesso.",
        "success"
    )->back([
        "id_user" => $user->getIdUser(),
        "name" => $user->getName(),
        "email" => $user->getEmail(),
        "type_user" => $user->getIdUserType()
    ]);
}

public function registerAdmin(array $data): void
{
    $data["type_user"] = 3;

    $this->register($data);
}

public function update(array $data): void
{
    if (
        !$this->validateNameEmail($data) ||
        !isset($data["password"]) ||
        empty($data["password"])
    ) {
        $this->call(
            400,
            "bad_request",
            "Dados inválidos.",
            "error"
        )->back();
        return;
    }

    $user = new User();
    var_dump($this->userAuthId);
    if (!$user->selectById($this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Usuário não encontrado.",
            "error"
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
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "Usuário atualizado com sucesso.",
        "success"
    )->back([
        "id_user" => $this->userAuthId,
        "name" => $user->getName(),
        "email" => $user->getEmail()
    ]);
}

public function updateAdmin(array $data): void
{
    if (!$this->authToken(3)) {
        $this->call(
            401,
            "unauthorized",
            "Token inválido.",
            "error"
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
            "error"
        )->back();
        return;
    }

    $user = new User();

    if (!$user->selectById($this->userAuthId)) {
        $this->call(
            404,
            "not_found",
            "Administrador não encontrado.",
            "error"
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
            "error"
        )->back();
        return;
    }

    $this->call(
    200,
    "success",
        "Administrador atualizado com sucesso.",
        "success"
    )->back([
        "id_user" => $this->userAuthId,
        "name" => $user->getName(),
        "email" => $user->getEmail()
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
        if (
            !$user->login($data["email"], $data["password"], $data["user_type"])
        ) {
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
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success",
        )->back($response);
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
