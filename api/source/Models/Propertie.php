<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Propertie extends Model
{
    protected ?int $id;
    protected ?int $idUser;
    protected ?string $location;
    protected ?int $numberRooms;
    protected ?int $availability;
    protected ?int $latePayment;

    public function __construct(
        ?int $id = null,
        ?int $idUser = null,
        ?string $location = null,
        ?int $numberRooms = null,
        ?int $availability = null,
        ?int $latePayment = null,
    ) {
        $this->id = $id;
        $this->idUser = $idUser;
        $this->location = $location;
        $this->numberRooms = $numberRooms;
        $this->availability = $availability;
        $this->latePayment = $latePayment;

        $this->table = "properties";
        $this->primaryKey = "id_property";
        $this->fillable = [
            "idUser",
            "location",
            "numberRooms",
            "availability",
            "latePayment",
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getIdUser(): ?int
    {
        return $this->idUser;
    }

    public function setIdUser(?int $idUser): void
    {
        $this->idUser = $idUser;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): void
    {
        $this->location = $location;
    }

    public function getNumberRooms(): ?int
    {
        return $this->numberRooms;
    }

    public function setNumberRooms(?int $numberRooms): void
    {
        $this->numberRooms = $numberRooms;
    }

    public function getAvailability(): ?int
    {
        return $this->availability;
    }

    public function setAvailability(?int $availability): void
    {
        $this->availability = $availability;
    }

    public function getLatePayment(): ?int
    {
        return $this->latePayment;
    }

    public function setLatePayment(?int $latePayment): void
    {
        $this->latePayment = $latePayment;
    }
    public function deleteById(int $id): bool
    {
        try {
            $query = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id);
            $stmt->execute();
            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Registro não encontrado ou inativo.";
                return false;
            }
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }
}
