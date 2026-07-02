<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faq\FaqCategory;

class FaqsCategories extends Api
{
    public function listAll(array $data): void
    {
        $category = new FaqCategory();

        $this->call(
            200,
            "success",
            "Lista de categorias",
            "success"
        )->back($category->selectAll());
    }

    public function listById(array $data): void
    {
        if (
            !isset($data["id"]) ||
            !filter_var($data["id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID inválido",
                "error"
            )->back();

            return;
        }

        $category = new FaqCategory();

        if (!$category->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Categoria não encontrada",
                "error"
            )->back();

            return;
        }

        $this->call(
            200,
            "success",
            "Categoria encontrada",
            "success"
        )->back([
            "id_category" => $category->getIdCategory(),
            "name" => $category->getName(),
            "active" => $category->getActive()
        ]);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem criar categorias",
                "error"
            )->back();

            return;
        }

        if (
            !isset($data["name"]) ||
            empty($data["name"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Nome da categoria é obrigatório",
                "error"
            )->back();

            return;
        }

        $category = new FaqCategory(
            null,
            $data["name"],
            true
        );

        if (!$category->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $category->getErrorMessage(),
                "error"
            )->back();

            return;
        }

        $this->call(
            201,
            "success",
            "Categoria criada com sucesso",
            "success"
        )->back([
            "id_category" => $category->getIdCategory(),
            "name" => $category->getName()
        ]);
    }
}