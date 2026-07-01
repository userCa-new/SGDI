<?php

namespace Source\Controller;
use Source\Models\Payment;
use Source\Controller\Api;

class Payments extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }
        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $payment = new Payment(
            null,
            $data["idContract"],
            $data["pix"],
            $data["receipt"],
            $data["value"],
            $data["paymentDate"],
            $data["status"],
        );

        if (!$payment->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $payment->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_payment" => $payment->getIdPayment(),
            "id_contract" => $payment->getIdContract(),
            "pix" => $payment->getPix(),
            "receipt" => $payment->getReceipt(),
            "value" => $payment->getValue(),
            "paymentDate" => $payment->getPaymentDate(),
            "status" => $payment->getStatus(),
        ];

        $this->call(
            201,
            "success",
            "Pagamento cadastrado com sucesso!",
            "success",
        )->back($response);
    }
    public function listById(array $data): void
    {
        if (
            !isset($data["id"]) ||
            empty($data["id"]) ||
            !filter_var($data["id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do atendimento é obrigatório e deve ser um número inteiro",
                "error",
            )->back();
            return;
        }

        $pagamento = new Payment();
        if (!$pagamento->selectById($data["id"])) {
            $this->call(
                404,
                "not_found",
                "Pagamento não encontrado",
                "error",
            )->back();
            return;
        }
        $response = [
            "id_payment" => $pagamento->getIdPayment(),
            "id_contract" => $pagamento->getIdContract(),
            "pix" => $pagamento->getPix(),
            "receipt" => $pagamento->getReceipt(),
            "value" => $pagamento->getValue(),
            "paymentDate" => $pagamento->getPaymentDate(),
            "status" => $pagamento->getStatus(),
        ];

        $this->call(200, "success", "Atendimento encontrado", "success")->back(
            $response,
        );
    }
    public function listAll(array $data): void
    {
        echo "Aura";
        $payment = new Payment();
        $this->call(200, "success", "Lista de propriedades", "success")->back(
            $payment->selectAll(),
        );
    }

    public function delete(array $data): void
    {
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Id do pagamento é obrigatório e deve ser um número inteiro",
            )->back();
            return;
        }

        $payment = new Payment();
        if (!$payment->deleteById($data["id"])) {
            $this->call(
                500,
                "internal_server_error",
                $payment->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Pagamento excluido com sucesso",
            "success",
        )->back();
    }
    public function update(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Token de autenticação inválido ou expirado.",
                "error",
            )->back();
            return;
        }
        if (!filter_var($data["id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "Id do pagamento é obrigatório e deve ser um número inteiro",
            )->back();
            return;
        }

        if (!$this->validate($data)) {
            $this->call(
                400,
                "bad_request",
                "Dados incorretos ou campos obrigatórios ausentes.",
                "error",
            )->back();
            return;
        }

        $payment = new Payment();
        $payment->setIdPayment($data["id"]);
        $payment->setIdContract($data["id_contract"]);
        $payment->setPix($data["pix"]);
        $payment->setReceipt($data["receipt"]);
        $payment->setValue($data["value"]);
        $payment->setPaymentDate($data["payment_date"]);
        $payment->setStatus($data["status"]);

        if (!$payment->updateById()){
            $this->call(
                500,
                "internal_server_error",
                $payment->getErrorMessage(),
                "error",
            )->back();
            return;
        }

        $response = [
            "id_payment" => $payment->getIdPayment(),
            "id_contract" => $payment->getIdContract(),
            "pix" => $payment->getPix(),
            "receipt" => $payment->getReceipt(),
            "value" => $payment->getValue(),
            "paymentDate" => $payment->getPaymentDate(),
            "status" => $payment->getStatus(),
        ];

        $this->call(
            200,
            "success",
            "Pagamento atualizado com sucesso!",
            "success",
        )->back($response);
    }

    public function validate(array $data): bool
    {
        if (
            !isset($data["idContract"]) ||
            !isset($data["pix"]) ||
            !isset($data["receipt"]) ||
            !isset($data["value"]) ||
            !isset($data["paymentDate"]) ||
            !isset($data["status"]) ||
            empty($data["idContract"]) ||
            empty($data["pix"]) ||
            empty($data["receipt"]) ||
            empty($data["value"]) ||
            empty($data["paymentDate"]) ||
            empty($data["status"])
        ) {
            return false;
        }
        return true;
    }
}
