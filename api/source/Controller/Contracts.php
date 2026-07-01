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
                "unauthorized",
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

        $contract = new Contract(
            null,
            $data["id_property"],
            $this->userAuthId,
            $data["rent_value"],
            $data["start_date"],
            $data["end_date"],
            $data["status"],
        );

        if (!$contract->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $contract->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $contract->getId(),
            "id_property" => $contract->getIdProperty(),
            "id_user" => $contract->getIdUser(),
            "rent_value" => $contract->getRentValue(),
            "start_date" => $contract->getStartDate(),
            "end_date" => $contract->getEndDate(),
            "status" => $contract->getStatus(),
        ];

        $this->call(
            201,
            "success",
            "Contrato cadastrado com sucesso!",
            "success",
        )->back($response);
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["id"]) ||
            empty($data["id"]) ||
            !filter_var($data["id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "Id do contrato é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $contract = new Contract();
        if (!$contract->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Contrato não encontrado",
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $contract->getId(),
            "id_property" => $contract->getIdProperty(),
            "id_user" => $contract->getIdUser(),
            "rent_value" => $contract->getRentValue(),
            "start_date" => $contract->getStartDate(),
            "end_date" => $contract->getEndDate(),
            "status" => $contract->getStatus(),
        ];

        $this->call(200, "success", "Contrato encontrado", "success")->back(
            $response,
        );
    }

    public function listAll(array $data): void
    {
        $contract = new Contract();
        $this->call(200, "success", "Lista de contratos", "success")->back(
            $contract->selectAll(),
        );
    }

    public function update(array $data): void
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
        if (
            !isset($data["id"]) ||
            !filter_var($data["id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do contrato é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }
        var_dump($data);
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $contract = new Contract();
        $contract->setId($data["id"]);
        $contract->setIdProperty($data["id_property"]);
        $contract->setRentValue($data["rent_value"]);
        $contract->setStartDate($data["start_date"]);
        $contract->setEndDate($data["end_date"]);
        $contract->setStatus($data["status"]);

        if (!$contract->updateById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $contract->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Contrato atualizado com sucesso",
            "success",
        )->back();
    }

    public function delete(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Id do contrato é obrigatório e deve ser um número inteiro",
            )->back();
            return;
        }

        $contract = new Contract();
        if (!$contract->deleteById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $contract->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Contrato excluido com sucesso",
            "success",
        )->back();
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["id_property"]) ||
            !filter_var($data["id_property"], FILTER_VALIDATE_INT) ||
            !isset($data["rent_value"]) ||
            !is_numeric($data["rent_value"]) ||
            !isset($data["start_date"]) ||
            empty($data["start_date"]) ||
            !isset($data["end_date"]) ||
            !isset($data["status"]) ||
            empty($data["status"])
        ) {
            return false;
        }

        return true;
    }
}
