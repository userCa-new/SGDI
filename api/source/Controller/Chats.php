<?php

namespace Source\Controller;

use Source\Models\Chat;
use Source\Controller\Api;

class Chats extends Api
{
    public function register(array $data): void
    {
        
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes",
                "error",
            )->back();
            return;
        }

        $chat = new Chat(null, $data["id_property"], $data["creation_date"]);

        if (!$chat->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $chat->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_chat" => $chat->getIdChat(),
            "id_property" => $chat->getIdProperty(),
            "creationDate" => $chat->getCreationDate(),
        ];

        $this->call(
            200,
            "success",
            "Chat registrado com sucesso",
            "success",
        )->back($response);
    }

    public function listAll(array $data): void
    {
        $chat = new Chat();
        $this->call(200, "success", "Lista de chats", "success")->back(
            $chat->selectAll(),
        );
    }

    public function listById(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do chat é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $chat = new Chat();
        if (!$chat->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Chat não encontrado",
                "error",
            )->back();
            return;
        }
        $response = [
            "id_chat" => $chat->getIdChat(),
            "id_property" => $chat->getIdProperty(),
            "creation_date" => $chat->getCreationDate(),
        ];

        $this->call(
            200,
            "success",
            "Chat encontrado com sucesso",
            "success",
        )->back($response);
    }

    public function delete(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "id do chat é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $chat = new Chat();

        if (!$chat->deleteById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $chat->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Chat excluido com sucesso",
            "success",
        )->back();
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["id_property"]) ||
            empty($data["id_property"]) ||
            !isset($data["creation_date"]) ||
            empty($data["creation_date"])
        ) {
            return false;
        }
        return true;
    }
}
