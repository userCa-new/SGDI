<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Propertie extends Model
{
   protected ?int $id;
   protected ?int $idOwner; 
   protected ?string $location;
   protected ?int $numberRooms;
   protected ?int $availability;
   protected ?int $latePayment;

   public function __construct(
    ?int $id = null,
    ?int $idOwner = null,
    ?string $location = null,
    ?int $numberRooms = null,
    ?int $availability = null,
    ?int $latePayment = null,
   )
   {
    $this->id = $id;
    $this->idOwner = $idOwner;
    $this->location = $location;
    $this->numberRooms = $numberRooms;
    $this->availability = $availability;
    $this->latePayment = $latePayment;

    $this->table = "properties";
    $this->primaryKey = "id_property";
    $this->fillable = ["idOwner", "location", "numberRooms", "availability", "latePayment"];
   }

   public function getId(): ?int
   {
    return $this->id;
   }

   public function setId(?int $id): void
   {
    $this->id = $id;
   }

   public function getIdOwner(): ?int 
   {
    return $this->idOwner;
   }

   public function setIdOwner(?int $idOwner): void
   {
     $this->idOwner = $idOwner;
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
}