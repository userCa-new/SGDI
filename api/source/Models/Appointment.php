<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Appointment extends Model
{
    protected ?int $id;
    protected ?int $idProperty;
    protected ?string $date;
    protected ?string $observation;
    protected ?int $completed;

    public function __construct(
        ?int $idAppointment = null,
        ?int $idProperty = null,
        ?string $date = null,
        ?string $observation = null,
        ?int $completed = null,
    ) {
        $this->idAppointment = $idAppointment;
        $this->idProperty = $idProperty;
        $this->date = $date;
        $this->observation = $observation;
        $this->completed = $completed;

        $this->table = "appointments";
        $this->primaryKey = "id_appointment";
        $this->fillable = ["idProperty", "date", "observation", "completed"];
    }

    public function getIdAppointment(): ?int
    {
        return $this->idAppointment;
    }
    public function setIdAppointment(?int $idAppointment): void
    {
        $this->idAppointment = $idAppointment;
    }

    public function getIdProperty(): ?int
    {
        return $this->idProperty;
    }
    public function setIdProperty(?int $idProperty): void
    {
        $this->idProperty = $idProperty;
    }

    public function getDate(): ?string
    {
        return $this->date;
    }
    public function setDate(?string $date): void
    {
        $this->date = $date;
    }

    public function getObservation(): ?string
    {
        return $this->observation;
    }
    public function setObservation(?string $observation): void
    {
        $this->observation = $observation;
    }

    public function getCompleted(): ?int
    {
        return $this->completed;
    }
    public function setCompleted(?int $completed): void
    {
        $this->completed = $completed;
    }

    public function insert(): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE date = :date";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":date", $this->date);
        $stmt->execute();

        if ($stmt->fetch()) {
            $this->errorMessage = "Data indisponível.";
            return false;
        }

        if (!parent::insert()) {
            return false;
        }

        return true;
    }
}
