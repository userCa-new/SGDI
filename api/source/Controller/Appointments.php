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
            $data["completed"] ? 1 : 0,
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
    public function update(array $data): void
    {   
     
        if (!$this->validate($data) || !isset($data["id"]) || !filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $atendimento = new Appointment();
        if (!$atendimento->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Atendimento não encontrado.",
                "error",
            )->back();
            return;
        }

        $atendimento->setIdProperty($data["id_property"]);
        $atendimento->setDate($data["date"]);
        $atendimento->setObservation($data["observation"]);
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
            "id" => $atendimento->getId(),
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
     
        if(!isset($data["id"]) || empty($data["id"]) || !filter_var($data["id"], FILTER_VALIDATE_INT))
        {
            $this->call(400,
            "bad_request",
            "ID do atendimento é obrigatório e deve ser um número inteiro",
            "error"
            )->back();
            return;
        }

        $atendimento = new Appointment();
        if(!$atendimento->selectById($data["id"]))
        {
            $this->call(
            404,
            "not_found",
            "Atendimento não encontrado",
            "error"
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
        
        $this->call(200, "success", "Atendimento encontrado", "success")->back($response);
        
    }

    public function delete (array $data): void
    {
        if(!filter_var($data["id"], FILTER_VALIDATE_INT))
        {
            $this->call(
            400,
            "bad_request",
            "ID do atendimento é obrigatório e deve ser um número inteiro",
            "error"
            )->back();
            return;
        }
        var_dump($data["id"]);
        $atendimento = new Appointment();

        if(!$atendimento->deleteById($data["id"]))
        {
            $this->call(500, "internal_server_error", $atendimento->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Atendimento excluido com sucesso", "success")->back();
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
