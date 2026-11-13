<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;
use PDOException;

class Propertie extends Model
{
    protected ?int $idProperty;
    protected ?int $idOwner;
    protected ?string $location;
    protected ?int $numberOfRooms;
    protected ?int $availability;
    protected ?int $latePayment;

    public function __construct(
        ?int $idProperty = null,
        ?int $idOwner = null,
        ?string $location = null,
        ?int $numberOfRooms = null,
        ?int $availability = null,
        ?int $latePayment = null,
    ) {
        $this->idProperty = $idProperty;
        $this->idOwner = $idOwner;
        $this->location = $location;
        $this->numberOfRooms = $numberOfRooms;
        $this->availability = $availability;
        $this->latePayment = $latePayment;

        $this->table = "properties";
        $this->primaryKey = "id_property";
        $this->fillable = [
            "idOwner",
            "location",
            "numberOfRooms",
            "availability",
            "latePayment",
        ];
    }

    public function getIdProperty(): ?int
    {
        return $this->idProperty;
    }

    public function setIdProperty(?int $idProperty): void
    {
        $this->idProperty = $idProperty;
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

    public function getNumberOfRooms(): ?int
    {
        return $this->numberOfRooms;
    }

    public function setNumberOfRooms(?int $numberOfRooms): void
    {
        $this->numberOfRooms = $numberOfRooms;
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

    public function listForOwner(int $ownerId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT * FROM {$this->table} WHERE id_owner = :owner_id ORDER BY id_property"
            );
            $stmt->bindValue(":owner_id", $ownerId, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os imóveis do proprietário.";
            return null;
        }
    }

    public function listForTenant(int $tenantId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT DISTINCT p.*
                 FROM {$this->table} p
                 INNER JOIN contracts c ON c.id_property = p.id_property
                 WHERE c.id_user = :tenant_id AND c.status = 'ACTIVE'
                 ORDER BY p.id_property"
            );
            $stmt->bindValue(":tenant_id", $tenantId, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os imóveis vinculados à locação.";
            return null;
        }
    }

    public function belongsToOwner(int $propertyId, int $ownerId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table}
                 WHERE id_property = :property_id AND id_owner = :owner_id
                 LIMIT 1"
            );
            $stmt->bindValue(":property_id", $propertyId, \PDO::PARAM_INT);
            $stmt->bindValue(":owner_id", $ownerId, \PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function belongsToTenant(int $propertyId, int $tenantId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table} p
                 INNER JOIN contracts c ON c.id_property = p.id_property
                 WHERE p.id_property = :property_id AND c.id_user = :tenant_id
                   AND c.status = 'ACTIVE'
                 LIMIT 1"
            );
            $stmt->bindValue(":property_id", $propertyId, \PDO::PARAM_INT);
            $stmt->bindValue(":tenant_id", $tenantId, \PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
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
