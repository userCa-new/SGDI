<?php
//a
namespace Source\Controller;

use Source\Models\Message;
use Source\Controller\Api;

class Messages extends Api
{
    public function register(array $data): void
    {
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $message = new Message(
            null,
            $data["idChat"],
            $data["idSender"],
            $data["message"],
            $data["dateTime"],
        );
        if (!$message->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $message->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $message->getId(),
            "idChat" => $message->getIdChat(),
            "idSender" => $message->getIdSender(),
            "message" => $message->getMessage(),
            "dateTime" => $message->getDateTime(),
        ];
        $this->call(
            200,
            "success",
            "mensagem cadastrada com sucesso!",
            "success",
        )->back($response);
    }

    public function listAll(array $data): void
    {
        $message = new Message();
        $this->call(200, "success", "Lista de messagens", "success")->back(
            $message->selectAll(),
        );
    }

    public function listById(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da messagem é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $message = new Message();
        if (!$message->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Mensagem não encontrada",
                "error",
            )->back();
            return;
        }
        $response = [
            "id" => $message->getId(),
            "idChat" => $message->getIdChat(),
            "idSender" => $message->getIdSender(),
            "message" => $message->getMessage(),
            "dateTime" => $message->getDateTime(),
        ];

        $this->call(
            200,
            "success",
            "Mensagem encontrada com sucesso",
            "success",
        )->back($response);
    }

    public function update(array $data): void {}

    public function delete(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "id da messagem é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $message = new Message();

        if (!$message->deleteById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $message->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Messagem excluida com sucesso",
            "success",
        )->back();
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["idChat"]) ||
            empty($data["idChat"]) ||
            !isset($data["idSender"]) ||
            empty($data["idSender"]) ||
            !isset($data["message"]) ||
            empty($data["message"]) ||
            !isset($data["dateTime"]) ||
            empty($data["dateTime"])
        ) {
            return false;
        }
        return true;
    }
}
