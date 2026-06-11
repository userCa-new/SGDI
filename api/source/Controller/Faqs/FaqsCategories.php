<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faq\FaqCategory;

class FaqsCategories extends Api
{
    public function listAll (array $data): void
    {
        $faqCategory = new FaqCategory();
        $this->call(200,"success","Lista de categorias de FAQ","success")->back($faqCategory->selectAll());
    }

    public function listById(array $data): void
    {
        if(!isset($data["categoryId"]) || empty($data["categoryId"]) || !filter_var($data["categoryId"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da categoria é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faqCategory = new FaqCategory();
        if(!$faqCategory->selectById($data["categoryId"])) {
            $this->call(
                404,
                "not_found",
                "Categoria não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $faqCategory->getId(),
            "name" => $faqCategory->getName()
        ];

        $this->call(200,"success","Categoria encontrada","success")->back($response);
    }

    public function validate (array $data): bool
    {
        if(!isset($data["name"])  ||
            empty($data["name"])) 
        {
            return false;
        }
        return true;
    }
}