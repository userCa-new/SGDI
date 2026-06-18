<?php

namespace Source\Controller;

use Source\Models\Appointment;
use Source\Controller\Api;

class Appointments extends Api
{
    public function register(array $data): void
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $atendimento = new Appointment(
            null,
            $data["id_property"],
            $data["date"],
            $data["observation"],
            $data["completed"],
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
            "id" => $atendimento->getId(),
            "id_property" => $atendimento->getPropertyId(),
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

    public function validate(array $data): bool
    {
        if (
            !isset($data["id_property"]) ||
            !isset($data["date"]) ||
            !isset($data["observation"]) ||
            !isset($data["completed"]) ||
            empty($data["id_property"]) ||
            empty($data["date"]) ||
            empty($data["observation"]) ||
            !filter_var($data["id_property"], FILTER_VALIDATE_INT)
        ) {
            return false;
        }
        return true;
    }
}
