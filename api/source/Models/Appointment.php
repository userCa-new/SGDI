<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Appointment extends Model
{
    protected ?int $id;
    protected ?int $id_property;
    protected ?string $date;
    protected ?string $observation;
    protected ?bool $completed;

    public function __construct(
        ?int $id = null,
        ?int $id_property = null,
        ?string $date = null,
        ?string $observation = null,
        ?bool $completed = null,
    ) {
        $this->id = $id;
        $this->id_property = $id_property;
        $this->date = $date;
        $this->observation = $observation;
        $this->completed = $completed;

        $this->table = "appointments";
        $this->primaryKey = "id_appointment";
        $this->fillable = ["id_property", "date", "observation", "completed"];
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getPropertyId(): ?int
    {
        return $this->id_property;
    }
    public function setPropertyId(?int $id_property): void
    {
        $this->id_property = $id_property;
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

    public function getCompleted(): ?bool
    {
        return $this->completed;
    }
    public function setCompleted(?bool $completed): void
    {
        $this->completed = $completed;
    }

    public function insert(): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE date = :date";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":date", $this->date);
        $stmt->execute();

        if ($stmt->fetch()) {
            $this->errorMessage = "Data indisponível.";
            return false;
        }

        if (!parent::insert()) {
            $this->errorMessage =
                "Algo deu errado ao salvar o registro no banco.";
            return false;
        }

        return true;
    }
}
