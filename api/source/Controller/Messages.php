<?php

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
        var_dump($data);
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
