<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
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

    public function listForOwner(int $ownerId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT c.*
                 FROM {$this->table} c
                 INNER JOIN properties p ON p.id_property = c.id_property
                 WHERE p.id_owner = :owner_id
                 ORDER BY c.start_date DESC, c.id_contract DESC"
            );
            $stmt->bindValue(":owner_id", $ownerId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os contratos do proprietário.";
            return null;
        }
    }

    public function listForTenant(int $tenantId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT * FROM {$this->table}
                 WHERE id_user = :tenant_id
                 ORDER BY start_date DESC, id_contract DESC"
            );
            $stmt->bindValue(":tenant_id", $tenantId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os contratos do inquilino.";
            return null;
        }
    }

    public function belongsToOwner(int $contractId, int $ownerId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table} c
                 INNER JOIN properties p ON p.id_property = c.id_property
                 WHERE c.id_contract = :contract_id AND p.id_owner = :owner_id
                 LIMIT 1"
            );
            $stmt->bindValue(":contract_id", $contractId, PDO::PARAM_INT);
            $stmt->bindValue(":owner_id", $ownerId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function belongsToTenant(int $contractId, int $tenantId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table}
                 WHERE id_contract = :contract_id AND id_user = :tenant_id
                 LIMIT 1"
            );
            $stmt->bindValue(":contract_id", $contractId, PDO::PARAM_INT);
            $stmt->bindValue(":tenant_id", $tenantId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function tenantHasActiveProperty(int $tenantId, int $propertyId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table}
                 WHERE id_user = :tenant_id AND id_property = :property_id
                   AND status = 'ACTIVE'
                 LIMIT 1"
            );
            $stmt->bindValue(":tenant_id", $tenantId, PDO::PARAM_INT);
            $stmt->bindValue(":property_id", $propertyId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }

    }

    public function hasRecordsForProperty(int $propertyId): ?bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table}
                 WHERE id_property = :property_id
                 LIMIT 1"
            );
            $stmt->bindValue(":property_id", $propertyId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível verificar os contratos vinculados ao imóvel.";
            return null;
        }
    }
}
