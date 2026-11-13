<?php

namespace Source\Controller;

use Source\Models\Propertie;
use Source\Models\PropertyImage;
use Source\Models\Contract;
use Source\Models\Appointment;
use Source\Support\ImageStorage;
use Source\Controller\Api;

class Properties extends Api
{
    public function insert(array $data): void
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
        // $data = json_decode(file_get_contents("php://input"), true);
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
            $data["number_of_rooms"],
            $data["availability"] ? 1 : 0,
            $data["late_payment"] ? 1 : 0,
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
            "id_property" => $propriedade->getIdProperty(),
            "location" => $propriedade->getLocation(),
            "number_of_rooms" => $propriedade->getNumberOfRooms(),
            "availability" => $propriedade->getAvailability(),
            "late_payment" => $propriedade->getLatePayment(),
        ];

        $this->call(
            201,
            "success",
            "Propriedade cadastrada com sucesso!",
            "success",
        )->back($response);
    }
    public function listAll(): void
    {
        $propriedade = new Propertie();
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

        $properties = $typeId === 2
            ? $propriedade->listForOwner($this->userAuthId)
            : $propriedade->listForTenant($this->userAuthId);
        if ($properties === null) {
            $this->call(
                500,
                "internal_server_error",
                $propriedade->getErrorMessage() ?? "Não foi possível carregar os imóveis.",
                "error",
            )->back();
            return;
        }
        $this->call(200, "success", "Lista de propriedades", "success")->back(
            $properties,
        );
    }

    public function listMine(): void
    {
        $this->listAll();
    }

    public function delete(array $data): void
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
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "id da propriedade é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }
        $propertyId = (int) $data["id"];
        $property = new Propertie();
        if (!$property->belongsToOwner($propertyId, $this->userAuthId)) {
            $this->call(
                404,
                "not_found",
                "Imóvel não encontrado para este proprietário.",
                "error",
            )->back();
            return;
        }

        $hasContracts = (new Contract())->hasRecordsForProperty($propertyId);
        $hasAppointments = (new Appointment())->hasRecordsForProperty($propertyId);
        if ($hasContracts === null || $hasAppointments === null) {
            $this->call(
                500,
                "internal_server_error",
                "Não foi possível verificar os registros vinculados ao imóvel.",
                "error",
            )->back();
            return;
        }
        if ($hasContracts || $hasAppointments) {
            $this->call(
                409,
                "conflict",
                "Não é possível remover um imóvel com contratos ou atendimentos vinculados. Remova os registros relacionados primeiro.",
                "error",
            )->back();
            return;
        }

     
        $imagePaths = (new PropertyImage())->pathsByProperty($propertyId);
        if ($imagePaths === null) {
            $this->call(
                500,
                "internal_server_error",
                "Não foi possível verificar as imagens do imóvel antes de excluí-lo.",
                "error",
            )->back();
            return;
        }

        if (!$property->deleteById($propertyId)) {
            $this->call(
                500,
                "internal_server_error",
                $property->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        foreach ($imagePaths as $imagePath) {
            ImageStorage::remove($imagePath);
        }

        $this->call(
            200,
            "success",
            "propriedade excluida com sucesso",
            "success",
        )->back();
    }
    public function listById(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da propriedade é obrigatório e deve ser um número inteiro",
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
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }

        $propriedade = new Propertie();
        if (!$propriedade->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Propriedade não encontrada",
                "error",
            )->back();
            return;
        }
        $canRead = $typeId === 2
            ? $propriedade->getIdOwner() === $this->userAuthId
            : $propriedade->belongsToTenant((int) $data["id"], $this->userAuthId);
        if (!$canRead) {
            $this->call(
                404,
                "not_found",
                "Imóvel não encontrado para este usuário.",
                "error",
            )->back();
            return;
        }
        $response = [
            "id_property" => $propriedade->getIdProperty(),
            "location" => $propriedade->getLocation(),
            "number_of_rooms" => $propriedade->getNumberOfRooms(),
            "availability" => $propriedade->getAvailability(),
            "late_payment" => $propriedade->getLatePayment(),
        ];

        $this->call(
            200,
            "success",
            "Propriedade encontrada com sucesso",
            "success",
        )->back($response);
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
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da propriedade é obrigatório e deve ser um número inteiro",
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

        $propriedade = new Propertie();
        if (
            !$propriedade->selectById((int) $data["id"]) ||
            $propriedade->getIdOwner() !== $this->userAuthId
        ) {
            $this->call(
                404,
                "not_found",
                "Imóvel não encontrado para este proprietário.",
                "error",
            )->back();
            return;
        }
        $propriedade->setIdProperty($data["id_property"]);
        $propriedade->setLocation($data["location"]);
        $propriedade->setNumberOfRooms($data["number_of_rooms"]);
        $propriedade->setAvailability($data["availability"] ? 1 : 0);
        $propriedade->setLatePayment($data["late_payment"] ? 1 : 0);
        if (!$propriedade->updateById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $propriedade->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Propriedade atualizada com sucesso",
            "success",
        )->back();
    }
    public function validate(array $data): bool
    {
        return isset(
            $data["location"],
            $data["number_of_rooms"],
            $data["availability"],
            $data["late_payment"],
        ) &&
            trim($data["location"]) !== "" &&
            filter_var($data["number_of_rooms"], FILTER_VALIDATE_INT) !== false;
    }
}
