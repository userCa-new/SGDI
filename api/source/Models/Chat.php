<?php

namespace Source\Models;

use Source\Core\Model;

class Chat extends Model
{
    private ?int $idChat;
    private ?int $idProperty;
    private ?string $creationDate;

    public function __construct(
        ?int $idChat = null,
        ?int $idProperty = null,
        ?string $creationDate = null,
    ) {
        $this->idChat = $idChat;
        $this->idProperty = $idProperty;
        $this->creationDate = $creationDate;

        $this->table = "chat";
        $this->primaryKey = "id_chat";

        $this->fillable = ["idContract", "creationDate"];
    }

    public function getIdChat(): ?int
    {
        return $this->idChat;
    }

    public function setIdChat(?int $idChat): void
    {
        $this->idChat = $idChat;
    }

    public function getIdProperty(): ?int
    {
        return $this->idProperty;
    }

    public function setIdProperty(?int $idProperty): void
    {
        $this->idProperty = $idProperty;
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
