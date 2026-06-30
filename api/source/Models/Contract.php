<?php

namespace Source\Models;

use Source\Core\Model;

class Contract extends Model
{
    private ?int $id = null;
    private ?int $idProperty = null;
    private ?int $idUser = null;
    private ?float $rentValue = null;
    private ?string $startDate = null;
    private ?string $endDate = null;
    private ?string $status = null;

    public function __construct(
        ?int $id = null,
        ?int $idProperty = null,
        ?int $idUser = null,
        ?float $rentValue = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $status = null,
    ) {
        $this->id = $id;
        $this->idProperty = $idProperty;
        $this->idUser = $idUser;
        $this->rentValue = $rentValue;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->status = $status;

        $this->table = "contracts";
        $this->primaryKey = "id_contract";

        $this->fillable = [
            "idProperty",
            "idUser",
            "rentValue",
            "startDate",
            "endDate",
            "status",
        ];
    }

    public function getIdContract(): ?int
    {
        return $this->id;
    }

    public function setIdContract(?int $id): void
    {
        $this->id = $id;
    }

    public function getIdProperty(): ?int
    {
        return $this->idProperty;
    }

    public function setIdProperty(?int $idProperty): void
    {
        $this->idProperty = $idProperty;
    }

    public function getIdUser(): ?int
    {
        return $this->idUser;
    }

    public function setIdUser(?int $idUser): void
    {
        $this->idUser = $idUser;
    }

    public function getRentValue(): ?float
    {
        return $this->rentValue;
    }

    public function setRentValue(?float $rentValue): void
    {
        $this->rentValue = $rentValue;
    }

    public function getStartDate(): ?string
    {
        return $this->startDate;
    }

    public function setStartDate(?string $startDate): void
    {
        $this->startDate = $startDate;
    }

    public function getEndDate(): ?string
    {
        return $this->endDate;
    }

    public function setEndDate(?string $endDate): void
    {
        $this->endDate = $endDate;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }
}
