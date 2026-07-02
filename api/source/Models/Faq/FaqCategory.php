<?php

namespace Source\Models\Faq;

use Source\Core\Model;
use Source\Core\Connect;

class FaqCategory extends Model
{
    private ?int $idCategory;
    private ?string $name;
    private ?int $active;

    public function __construct(
        ?int $idCategory = null,
        ?string $name = null,
        ?int $active = 1,
    ) {
        $this->idCategory = $idCategory;
        $this->name = $name;
        $this->active = $active;

        $this->table = "faq_categories";
        $this->primaryKey = "id_category";
        $this->fillable = ["name", "active"];
    }

    public function getIdCategory(): ?int
    {
        return $this->idCategory;
    }

    public function setIdCategory(?int $idCategory): void
    {
        $this->idCategory = $idCategory;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }
}
