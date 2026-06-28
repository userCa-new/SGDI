<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Contract extends Model
{
    private ?int $id;
    private ?int $id_property;
    private ?int $id_user;
    private ?int $rent_value;
    private ?string $start_date;
    private ?string $end_date;
    private ?string $status;

    public function __construct(
        ?int $id = null,
        ?int $id_property = null,
        ?int $id_user = null,
        ?int $rent_value = null,
        ?string $start_date = null,
        ?string $end_date = null,
        ?string $status = null,
    ) {
        $this->id = $id;
        $this->id_property = $id_property;
        $this->id_user = $id_user;
        $this->rent_value = $rent_value;
        $this->start_date = $start_date;
        $this->end_date = $end_date;
        $this->status = $status;

        $this->table = "contracts";
        $this->primaryKey = "id_contract";
        $this->fillable = [
            "id_property",
            "id_user",
            "rent_value",
            "start_date",
            "end_date",
            "status",
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

    public function getIdProperty(): ?int
    {
        return $this->id_property;
    }

    public function setIdProperty(?int $id_property): void
    {
        $this->id_property = $id_property;
    }

    public function getIdUser(): ?int
    {
        return $this->id_user;
    }

    public function setIdUser(?int $id_user): void
    {
        $this->id_user = $id_user;
    }

    public function getRentValue(): ?int
    {
        return $this->rent_value;
    }

    public function setRentValue(?int $rent_value): void
    {
        $this->rent_value = $rent_value;
    }

    public function getStartDate(): ?string
    {
        return $this->start_date;
    }

    public function setStartDate(?int $start_date): void
    {
        $this->start_date = $start_date;
    }

    public function getEndDate(): ?string
    {
        return $this->end_date;
    }

    public function setEndDate(?int $end_date): void
    {
        $this->end_date = $end_date;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?int $status): void
    {
        $this->status = $status;
    }
}
