<?php

namespace Source\Models\Faq;

use Source\Core\Model;

class Faq extends Model
{
    private ?int $idFaq;
    private ?int $idCategory;
    private ?string $question;
    private ?string $answer;
    private ?int $active;

    public function __construct(
        ?int $idFaq = null,
        ?int $idCategory = null,
        ?string $question = null,
        ?string $answer = null,
        ?int $active = 1,
    ) {
        $this->idFaq = $idFaq;
        $this->idCategory = $idCategory;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;

        $this->table = "faqs";
        $this->primaryKey = "id_faq";
        $this->fillable = ["idCategory", "question", "answer", "active"];
    }

    public function getIdFaq(): ?int
    {
        return $this->idFaq;
    }

    public function setIdFaq(?int $idFaq): void
    {
        $this->idFaq = $idFaq;
    }

    public function getIdCategory(): ?int
    {
        return $this->idCategory;
    }

    public function setIdCategory(?int $idCategory): void
    {
        $this->idCategory = $idCategory;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(?string $question): void
    {
        $this->question = $question;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(?string $answer): void
    {
        $this->answer = $answer;
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
