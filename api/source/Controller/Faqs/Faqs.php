<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faq\Faq;

class Faqs extends Api
{

    public function listAll (array $data): void
    {
        $faq = new Faq();
        $this->call(200,"success","Lista de FAQs","success")->back($faq->selectAll());
    }

   public function listById(array $data): void
    {

        if(!isset($data["faqId"]) || empty($data["faqId"]) || !filter_var($data["faqId"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();
        if(!$faq->selectById($data["faqId"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ];

        $this->call(200,"success","FAQ encontrada","success")->back($response);
    }

    public function insert (array $data): void
    {

        $data = json_decode(file_get_contents("php://input"), true);
        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos question, answer e faqs_category_id são obrigatórios",
                "error"
            )->back();
            return;
        }

        $faq = new Faq(
            null,
            $data["idCategory"],
            $data["question"],
            $data["answer"]
        );

        if(!$faq->insert()){
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $faq->getId(),
            "idCategory" => $faq->getIdCategory(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ];

        $this->call(201,"success","FAQ inserido com sucesso","success")->back($response);

    }

    public function update (array $data): void
    {
       
        if(!filter_var($data["faqId"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "ID inválido ou campos obrigatórios ausentes",
                "error"
            )->back();
            return;
        }

        $faq = new Faq(
            null,
            $data["idCategory"],
            $data["question"],
            $data["answer"]
        );

        if(!$faq->updateById($data["faqId"])){
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ];

        $this->call(200,"success","Faq atualizado com sucesso","success")->back($response);
    }

    public function validate (array $data): bool
    {
        if(!isset($data["idCategory"]) || !isset($data["question"]) || !isset($data["answer"]) ||
            empty($data["idCategory"]) || empty($data["question"]) || empty($data["answer"]) ||
           !filter_var($data["idCategory"], FILTER_VALIDATE_INT)) {
            return false;
        }
        return true;
    }
}