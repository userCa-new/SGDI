<?php

namespace Source\Controller;

use Source\Models\Contract;
use Source\Controller\Api;

class Contracts extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unathorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $contratos = new Contract(
            null,
            $this->userAuthId,
            $data["id_property"],
            $data["rent_value"],
            $data["start_date"],
            $data["end_date"],
            $data["status"],
        );

        if (!$contratos->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $contratos->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $contratos->getId(),
            "id_property" => $contratos->getIdProperty(),
            "rent_value" => $contratos->getRentValue(),
            "start_date" => $contratos->getStartDate(),
            "end_date" => $contratos->getEndDate(),
            "status" => $contratos->getStatus(),
        ];

        $this->call(
            201,
            "success",
            "Contrato cadastrado com sucesso!",
            "success",
        )->back($response);
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["rent_value"]) ||
            empty($data["rent_value"]) ||
            !isset($data["start_date"]) ||
            empty($data["start_date"]) ||
            !isset($data["end_date"]) ||
            empty($data["end_date"]) ||
            !isset($data["status"]) ||
            empty($data["status"]) ||
            !filter_var($data["id_property"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }
        return true;
    }
}
