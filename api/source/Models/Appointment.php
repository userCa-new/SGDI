<?php

namespace Source\Models;

use PDO;
use PDOException;
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
        ?int $id = null,
        ?int $idProperty = null,
        ?string $date = null,
        ?string $observation = null,
        ?int $completed = null,
    ) {
        $this->id = $id;
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
        return $this->id;
    }
    public function setIdAppointment(?int $id): void
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

    public function listForOwner(int $ownerId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT a.*
                 FROM {$this->table} a
                 INNER JOIN properties p ON p.id_property = a.id_property
                 WHERE p.id_owner = :owner_id
                 ORDER BY a.date DESC, a.id_appointment DESC"
            );
            $stmt->bindValue(":owner_id", $ownerId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os atendimentos do proprietário.";
            return null;
        }
    }

    public function listForTenant(int $tenantId): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT DISTINCT a.*
                 FROM {$this->table} a
                 INNER JOIN contracts c ON c.id_property = a.id_property
                 WHERE c.id_user = :tenant_id AND c.status = 'ACTIVE'
                 ORDER BY a.date DESC, a.id_appointment DESC"
            );
            $stmt->bindValue(":tenant_id", $tenantId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar os atendimentos do inquilino.";
            return null;
        }
    }

    public function belongsToOwner(int $appointmentId, int $ownerId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table} a
                 INNER JOIN properties p ON p.id_property = a.id_property
                 WHERE a.id_appointment = :appointment_id AND p.id_owner = :owner_id
                 LIMIT 1"
            );
            $stmt->bindValue(":appointment_id", $appointmentId, PDO::PARAM_INT);
            $stmt->bindValue(":owner_id", $ownerId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function belongsToTenant(int $appointmentId, int $tenantId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table} a
                 INNER JOIN contracts c ON c.id_property = a.id_property
                 WHERE a.id_appointment = :appointment_id
                   AND c.id_user = :tenant_id AND c.status = 'ACTIVE'
                 LIMIT 1"
            );
            $stmt->bindValue(":appointment_id", $appointmentId, PDO::PARAM_INT);
            $stmt->bindValue(":tenant_id", $tenantId, PDO::PARAM_INT);
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
            $this->errorMessage = "Não foi possível verificar os atendimentos vinculados ao imóvel.";
            return null;
        }
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

        return parent::insert();
    }
}
