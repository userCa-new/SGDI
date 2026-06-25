<?php

namespace Source\Controller;

use Source\Models\Propertie;
use Source\Controller\Api;

class Properties extends Api
{
    public function insert(array $data): void
    {
        if(!$this->authToken(2)){
            $this->call(401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error")->back();
            return;
        }
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
        
        $propriedade = new Propertie(
            null,
            $this->userAuthId,
            $data["location"],
            $data["numberRooms"],
            $data["availability"] ? 1 : 0,
            $data["latePayment"] ? 1 : 0,
        );
        
        
        if (!$propriedade->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $propriedade->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id" => $propriedade->getId(),
            "location" => $propriedade->getLocation(),
            "numberRooms" => $propriedade->getNumberRooms(),
            "availability" => $propriedade->getAvailability(),
            "latePayment" => $propriedade->getLatePayment(),
        ];

        $this->call(
            201,
            "success",
            "Atendimento cadastrado com sucesso!",
            "success",
        )->back($response);
    }
    public function listAll(): void{
        $propriedade = new Propertie();
        $this->call(200,"success","Lista de propriedades","success")->back($propriedade->selectAll());
    }
    public function delete (array $data): void
    {
        if(!filter_var($data["id"], FILTER_VALIDATE_INT))
        {
            $this->call(
            400,
            "bad_request",
            "ID da propriedade é obrigatório e deve ser um número inteiro",
            "error"
            )->back();
            return;
        }
        var_dump($data["id"]);
        $propriedade = new Propertie();
        
        if(!$propriedade->deleteById($data["id"]))
        {
            $this->call(500, "internal_server_error", $propriedade->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Propriedade excluida com sucesso", "success")->back();
    }
    public function validate(array $data): bool
    {
        if (
            !isset($data["location"]) ||
            !isset($data["numberRooms"]) ||
            !isset($data["availability"]) ||
            !isset($data["latePayment"]) ||
            empty($data["location"]) ||
            empty($data["numberRooms"]) ||
            empty($data["availability"]) ||
            empty($data["latePayment"]) 
        )
        {
            return false;
        }
        return true;
    }
}

