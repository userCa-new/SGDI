<?php

namespace Source\Controller;

use Source\Models\Contract;
use Source\Models\Propertie;
use Source\Models\User;
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

        $property = new Propertie();
        $tenant = new User();
        if (
            !$property->belongsToOwner(
                (int) $data["id_property"],
                $this->userAuthId,
            ) ||
            !$tenant->isTenant((int) $data["id_user"])
        ) {
            $this->call(
                404,
                "not_found",
                "Imóvel ou inquilino não encontrado para este contrato.",
                "error",
            )->back();
            return;
        }

        $contract = new Contract(
            null,
            $data["id_property"],
            $data["id_user"],
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
            "id_contract" => $contract->getId(),
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

        $typeId = null;
        if ($this->authToken(2)) {
            $typeId = 2;
        } elseif ($this->authToken(1)) {
            $typeId = 1;
        } else {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
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
        $allowed = $typeId === 2
            ? $contract->belongsToOwner((int) $data["id"], $this->userAuthId)
            : $contract->belongsToTenant((int) $data["id"], $this->userAuthId);
        if (!$allowed) {
            $this->call(404, "not_found", "Contrato não encontrado para este usuário.", "error")->back();
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
        $typeId = null;
        if ($this->authToken(2)) {
            $typeId = 2;
        } elseif ($this->authToken(1)) {
            $typeId = 1;
        } else {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        $contract = new Contract();
        $rows = $typeId === 2
            ? $contract->listForOwner($this->userAuthId)
            : $contract->listForTenant($this->userAuthId);
        if ($rows === null) {
            $this->call(500, "internal_server_error", "Não foi possível carregar os contratos.", "error")->back();
            return;
        }
        $this->call(200, "success", "Lista de contratos", "success")->back(
            $rows,
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
        if (
            !$contract->belongsToOwner((int) $data["id"], $this->userAuthId) ||
            !(new Propertie())->belongsToOwner(
                (int) $data["id_property"],
                $this->userAuthId,
            ) ||
            !(new User())->isTenant((int) $data["id_user"])
        ) {
            $this->call(404, "not_found", "Contrato, imóvel ou inquilino não encontrado para este proprietário.", "error")->back();
            return;
        }
        $contract->setId($data["id"]);
        $contract->setIdProperty($data["id_property"]);
        $contract->setIdUser($data["id_user"]);
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
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Id do contrato é obrigatório e deve ser um número inteiro",
            )->back();
            return;
        }

        $contract = new Contract();
        if (!$contract->belongsToOwner((int) $data["id"], $this->userAuthId)) {
            $this->call(404, "not_found", "Contrato não encontrado para este proprietário.", "error")->back();
            return;
        }
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
        $propertyId = filter_var(
            $data["id_property"] ?? null,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]],
        );
        $tenantId = filter_var(
            $data["id_user"] ?? null,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]],
        );
        $rentValue = $data["rent_value"] ?? null;
        $startDate = $data["start_date"] ?? null;
        $endDate = $data["end_date"] ?? null;
        $status = $data["status"] ?? null;

        if (
            $propertyId === false ||
            $tenantId === false ||
            !is_numeric($rentValue) ||
            (float) $rentValue < 0 ||
            !$this->isValidDate($startDate) ||
            !$this->isValidDate($endDate) ||
            $endDate < $startDate ||
            !in_array($status, ["ACTIVE", "CLOSED", "PENDING"], true)
        ) {
            return false;
        }

        return true;
    }

    private function isValidDate(mixed $value): bool
    {
        if (!is_string($value)) {
            return false;
        }
        $date = \DateTimeImmutable::createFromFormat("!Y-m-d", $value);
        $errors = \DateTimeImmutable::getLastErrors();
        return $date !== false &&
            $date->format("Y-m-d") === $value &&
            ($errors === false ||
                ($errors["warning_count"] === 0 && $errors["error_count"] === 0));
    }
}
