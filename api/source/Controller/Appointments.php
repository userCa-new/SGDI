<?php

namespace Source\Controller;

use Source\Models\Appointment;
use Source\Models\Contract;
use Source\Controller\Api;

class Appointments extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken(1)) {
            if ($this->authToken(2)) {
                $this->call(
                    403,
                    "forbidden",
                    "A solicitação de atendimento está disponível apenas para inquilinos.",
                    "error",
                )->back();
                return;
            }

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

        if (!(new Contract())->tenantHasActiveProperty(
            $this->userAuthId,
            (int) $data["id_property"],
        )) {
            $this->call(
                404,
                "not_found",
                "O imóvel não está vinculado a uma locação ativa deste inquilino.",
                "error",
            )->back();
            return;
        }

        $atendimento = new Appointment(
            null,
            $data["id_property"],
            $data["date"],
            $data["observation"],
            0,
        );

        if (!$atendimento->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $atendimento->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $atendimento->getIdAppointment(),
            "id_property" => $atendimento->getIdProperty(),
            "date" => $atendimento->getDate(),
            "observation" => $atendimento->getObservation(),
            "completed" => $atendimento->getCompleted(),
        ];

        $this->call(
            201,
            "success",
            "Atendimento cadastrado com sucesso!",
            "success",
        )->back($response);
    }

    public function listAll(array $data): void
    {
        $typeId = null;
        if ($this->authToken(2)) {
            $typeId = 2;
        } elseif ($this->authToken(1)) {
            $typeId = 1;
        } else {
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }

        $appointment = new Appointment();
        $rows = $typeId === 2
            ? $appointment->listForOwner($this->userAuthId)
            : $appointment->listForTenant($this->userAuthId);
        if ($rows === null) {
            $this->call(
                500,
                "internal_server_error",
                $appointment->getErrorMessage() ?? "Não foi possível carregar os atendimentos.",
                "error",
            )->back();
            return;
        }
        $this->call(200, "success", "Lista de atendimentos", "success")->back(
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
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }
        if (!isset($data["completed"]) || !in_array($data["completed"], [0, 1, "0", "1", false, true], true)) {
            $this->call(400, "bad_request", "O estado de conclusão do atendimento é inválido.", "error")->back();
            return;
        }

        $atendimento = new Appointment();
        if (
            !$atendimento->belongsToOwner(
                (int) $data["id"],
                $this->userAuthId,
            ) ||
            !$atendimento->selectById($data["id"])
        ) {
            $this->call(
                404,
                "not_found",
                "Atendimento não encontrado.",
                "error",
            )->back();
            return;
        }
        $atendimento->setCompleted($data["completed"] ? 1 : 0);

        if (!$atendimento->updateById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $atendimento->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_appointment" => $atendimento->getIdAppointment(),
            "id_property" => $atendimento->getIdProperty(),
            "date" => $atendimento->getDate(),
            "observation" => $atendimento->getObservation(),
            "completed" => $atendimento->getCompleted(),
        ];

        $this->call(
            200,
            "success",
            "Atendimento atualizado com sucesso!",
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
                "ID do atendimento é obrigatório e deve ser um número inteiro",
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

        $atendimento = new Appointment();
        $allowed = $typeId === 2
            ? $atendimento->belongsToOwner((int) $data["id"], $this->userAuthId)
            : $atendimento->belongsToTenant((int) $data["id"], $this->userAuthId);
        if (!$allowed || !$atendimento->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Atendimento não encontrado",
                "error",
            )->back();
            return;
        }
        $response = [
            "id" => $data["id"],
            "idProperty" => $atendimento->getIdProperty(),
            "date" => $atendimento->getDate(),
            "observation" => $atendimento->getObservation(),
            "completed" => $atendimento->getCompleted(),
        ];

        $this->call(200, "success", "Atendimento encontrado", "success")->back(
            $response,
        );
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do atendimento é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }
        //var_dump($data["id"]);
        $atendimento = new Appointment();
        if (!$atendimento->belongsToTenant((int) $data["id"], $this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Atendimento não encontrado para este inquilino.",
                "error",
            )->back();
            return;
        }

        if (!$atendimento->deleteById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $atendimento->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Atendimento excluido com sucesso",
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
        if (
            $propertyId === false ||
            !isset($data["date"]) ||
            !isset($data["observation"]) ||
            !is_string($data["date"]) ||
            trim($data["date"]) === "" ||
            !is_string($data["observation"]) ||
            trim($data["observation"]) === "" ||
            !isset($data["completed"]) ||
            !in_array($data["completed"], [0, 1, "0", "1", false, true], true)
        ) {
            return false;
        }
        return true;
    }

}
