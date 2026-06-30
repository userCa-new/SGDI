<?php

namespace Source\Models;

use Source\Core\Model;

class Chat extends Model
{
    private ?int $id;
    private ?int $idContract;
    private ?string $creationDate;

    public function __construct(
        ?int $id = null,
        ?int $idContract = null,
        ?string $creationDate = null,
    ) {
        $this->id = $id;
        $this->idContract = $idContract;
        $this->creationDate = $creationDate;

        $this->table = "chat";
        $this->primaryKey = "id_chat";

        $this->fillable = ["idContract", "creationDate"];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getIdContract(): ?int
    {
        return $this->idContract;
    }

    public function setIdContract(?int $idContract): void
    {
        $this->idContract = $idContract;
    }

    public function getCreationDate(): ?string
    {
        return $this->creationDate;
    }

    public function setCreationDate(?string $creationDate): void
    {
        $this->creationDate = $creationDate;
    }
}
