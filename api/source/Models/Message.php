<?php
namespace Source\Models;

use Source\Core\Model;

class Message extends Model
{
    private ?int $idMessage = null;
    private ?int $idChat = null;
    private ?int $idSender = null;
    private ?string $message = null;
    private ?string $dateTime = null;

    public function __construct(
        ?int $idMessage = null,
        ?int $idChat = null,
        ?int $idSender = null,
        ?string $message = null,
        ?string $dateTime = null,
    ) {
        $this->idMessage = $idMessage;
        $this->idChat = $idChat;
        $this->idSender = $idSender;
        $this->message = $message;
        $this->dateTime = $dateTime;

        $this->table = "messages";
        $this->primaryKey = "id_message";

        $this->fillable = ["idChat", "idSender", "message", "dateTime"];
    }

    public function getIdMessage(): ?int
    {
        return $this->idMessage;
    }

    public function getIdChat(): ?int
    {
        return $this->idChat;
    }

    public function getIdSender(): ?int
    {
        return $this->idSender;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function getDateTime(): ?string
    {
        return $this->dateTime;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function setIdChat(?int $idChat): void
    {
        $this->idChat = $idChat;
    }

    public function setIdSender(?int $idSender): void
    {
        $this->idSender = $idSender;
    }

    public function setMessage(?string $message): void
    {
        $this->message = $message;
    }

    public function setDateTime(?string $dateTime): void
    {
        $this->dateTime = $dateTime;
    }
}
