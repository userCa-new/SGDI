<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

/**
 * Metadados das imagens de um imóvel (tabela property_images, relação 1:N com properties).
 * O binário fica no sistema de arquivos; aqui só o caminho relativo gerado por Upload.
 * Todas as consultas usam prepared statements.
 */
class PropertyImage extends Model
{
    protected ?int $idImage;
    protected ?int $idProperty;
    protected ?string $imagePath;
    protected ?string $altText;
    protected ?int $position;
    protected ?string $createdAt = null;

    public function __construct(
        ?int $idImage = null,
        ?int $idProperty = null,
        ?string $imagePath = null,
        ?string $altText = null,
        ?int $position = null,
    ) {
        $this->idImage = $idImage;
        $this->idProperty = $idProperty;
        $this->imagePath = $imagePath;
        $this->altText = $altText;
        $this->position = $position;

        $this->table = "property_images";
        $this->primaryKey = "id_image";
        $this->fillable = ["idProperty", "imagePath", "altText", "position"];
    }

    public function getIdImage(): ?int
    {
        return $this->idImage;
    }

    public function setIdImage(?int $idImage): void
    {
        $this->idImage = $idImage;
    }

    // Model::insert() chama setId() (se existir) para devolver o id gerado
    public function setId(int $id): void
    {
        $this->idImage = $id;
    }

    public function getIdProperty(): ?int
    {
        return $this->idProperty;
    }

    public function setIdProperty(?int $idProperty): void
    {
        $this->idProperty = $idProperty;
    }

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(?string $imagePath): void
    {
        $this->imagePath = $imagePath;
    }

    public function getAltText(): ?string
    {
        return $this->altText;
    }

    public function setAltText(?string $altText): void
    {
        $this->altText = $altText;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): void
    {
        $this->position = $position;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    /** @return array|null lista de imagens do imóvel (vazia se não houver); null em caso de falha */
    public function listByProperty(int $idProperty): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT id_image, id_property, image_path, alt_text, position, created_at
                 FROM {$this->table}
                 WHERE id_property = :id_property
                 ORDER BY position ASC, id_image ASC"
            );
            $stmt->bindValue(":id_property", $idProperty, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível listar as imagens do imóvel.";
            return null;
        }
    }

    /** @return string[]|null caminhos relativos das imagens do imóvel; null em caso de falha */
    public function pathsByProperty(int $idProperty): ?array
    {
        $rows = $this->listByProperty($idProperty);
        if ($rows === null) {
            return null;
        }
        return array_map(fn($row) => $row->image_path, $rows);
    }

    public function countByProperty(int $idProperty): ?int
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT COUNT(*) AS total FROM {$this->table} WHERE id_property = :id_property"
            );
            $stmt->bindValue(":id_property", $idProperty, PDO::PARAM_INT);
            $stmt->execute();
            return (int) $stmt->fetch()->total;
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível contar as imagens do imóvel.";
            return null;
        }
    }

    /** Próxima posição livre na galeria (0 quando ainda não há imagens). */
    public function nextPosition(int $idProperty): ?int
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT COALESCE(MAX(position) + 1, 0) AS next_position FROM {$this->table} WHERE id_property = :id_property"
            );
            $stmt->bindValue(":id_property", $idProperty, PDO::PARAM_INT);
            $stmt->execute();
            return (int) $stmt->fetch()->next_position;
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível calcular a posição da imagem.";
            return null;
        }
    }

    /** Carrega a imagem SOMENTE se ela pertencer ao imóvel informado. */
    public function findInProperty(int $idImage, int $idProperty): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT id_image, id_property, image_path, alt_text, position, created_at
                 FROM {$this->table}
                 WHERE id_image = :id_image AND id_property = :id_property
                 LIMIT 1"
            );
            $stmt->bindValue(":id_image", $idImage, PDO::PARAM_INT);
            $stmt->bindValue(":id_property", $idProperty, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch();

            if (!$row) {
                $this->errorMessage = "Imagem não encontrada neste imóvel.";
                return false;
            }

            $this->idImage = (int) $row->id_image;
            $this->idProperty = (int) $row->id_property;
            $this->imagePath = $row->image_path;
            $this->altText = $row->alt_text;
            $this->position = (int) $row->position;
            $this->createdAt = $row->created_at;
            return true;
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível consultar a imagem.";
            return false;
        }
    }

    /** Remove o registro SOMENTE se ele pertencer ao imóvel informado. */
    public function deleteInProperty(int $idImage, int $idProperty): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "DELETE FROM {$this->table} WHERE id_image = :id_image AND id_property = :id_property"
            );
            $stmt->bindValue(":id_image", $idImage, PDO::PARAM_INT);
            $stmt->bindValue(":id_property", $idProperty, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = "Imagem não encontrada neste imóvel.";
                return false;
            }
            return true;
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível remover o registro da imagem.";
            return false;
        }
    }

    public function beginTransaction(): bool
    {
        try {
            return Connect::getInstance()->beginTransaction();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function commit(): bool
    {
        try {
            return Connect::getInstance()->commit();
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }

    public function rollBack(): void
    {
        try {
            if (Connect::getInstance()->inTransaction()) {
                Connect::getInstance()->rollBack();
            }
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
        }
    }
}
