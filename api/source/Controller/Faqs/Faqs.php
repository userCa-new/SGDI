<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faq\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void
    {
        $faq = new Faq();

        $this->call(
            200,
            "success",
            "Lista de FAQs",
            "success"
        )->back($faq->selectAll());
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
                "ID da FAQ inválido",
                "error"
            )->back();

            return;
        }

        $faq = new Faq();

        if (!$faq->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrada",
                "error"
            )->back();

            return;
        }

        $this->call(
            200,
            "success",
            "FAQ encontrada",
            "success"
        )->back([
            "id_faq" => $faq->getIdFaq(),
            "id_category" => $faq->getIdCategory(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ]);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem cadastrar FAQs",
                "error"
            )->back();

            return;
        }

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados inválidos",
                "error"
            )->back();

            return;
        }

        $faq = new Faq(
            null,
            $data["id_category"],
            $data["question"],
            $data["answer"],
            true
        );

        if (!$faq->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $faq->getErrorMessage(),
                "error"
            )->back();

            return;
        }

        $this->call(
            201,
            "success",
            "FAQ cadastrada com sucesso",
            "success"
        )->back([
            "id_faq" => $faq->getIdFaq(),
            "id_category" => $faq->getIdCategory(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ]);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem atualizar FAQs",
                "error"
            )->back();

            return;
        }

        if (
            !isset($data["id"]) ||
            !filter_var($data["id"], FILTER_VALIDATE_INT) ||
            !$this->validate($data)
        ) {
            $this->call(
                400,
                "bad_request",
                "Dados inválidos",
                "error"
            )->back();

            return;
        }

        $faq = new Faq();

        if (!$faq->selectById((int)$data["id"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrada",
                "error"
            )->back();

            return;
        }

        $faq->setIdCategory($data["id_category"]);
        $faq->setQuestion($data["question"]);
        $faq->setAnswer($data["answer"]);

        if (!$faq->updateById((int)$data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $faq->getErrorMessage(),
                "error"
            )->back();

            return;
        }

        $this->call(
            200,
            "success",
            "FAQ atualizada com sucesso",
            "success"
        )->back([
            "id_faq" => $data["id"],
            "id_category" => $faq->getIdCategory(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer()
        ]);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem remover FAQs",
                "error"
            )->back();

            return;
        }

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

        $faq = new Faq();

        if (!$faq->deleteById((int)$data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $faq->getErrorMessage(),
                "error"
            )->back();

            return;
        }

        $this->call(
            200,
            "success",
            "FAQ removida com sucesso",
            "success"
        )->back();
    }

    private function validate(array $data): bool
    {
        return
            isset(
                $data["id_category"],
                $data["question"],
                $data["answer"]
            ) &&
            filter_var($data["id_category"], FILTER_VALIDATE_INT) &&
            !empty($data["question"]) &&
            !empty($data["answer"]);
    }
}