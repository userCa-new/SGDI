<?php

namespace Source\Models;
use Source\Core\Connect;
use Source\Core\Model;

class Payment extends Model
{
    private $idPayment;
    private $idContract;
    private $pix;
    private $receipt;
    private $value;
    private $paymentDate;
    private $status;

    public function __construct(
        $idPayment = null,
        $idContract = null,
        $pix = null,
        $receipt = null,
        $value = null,
        $paymentDate = null,
        $status = null,
    ) {
        $this->idPayment = $idPayment;
        $this->idContract = $idContract;
        $this->pix = $pix;
        $this->receipt = $receipt;
        $this->value = $value;
        $this->paymentDate = $paymentDate;
        $this->status = $status;

        $this->table = "payments";
        $this->primaryKey = "id_payment";
        $this->fillable = [
            "idContract",
            "pix",
            "receipt",
            "value",
            "paymentDate",
            "status",
        ];
    }

    public function getIdContract()
    {
        return $this->idContract;
    }

    public function setIdContract($idContract)
    {
        $this->idContract = $idContract;
    }

    public function getPix()
    {
        return $this->pix;
    }

    public function setPix($pix)
    {
        $this->pix = $pix;
    }
    public function getReceipt()
    {
        return $this->receipt;
    }

    public function setReceipt($receipt)
    {
        $this->receipt = $receipt;
    }

    public function getStatus()
    {
        return $this->status;
    }
    public function setStatus($status)
    {
        $this->status = $status;
    }
    public function getIdPayment()
    {
        return $this->idPayment;
    }
    public function setIdPayment($idPayment)
    {
        $this->idPayment = $idPayment;
    }
    public function getValue()
    {
        return $this->value;
    }
    public function setValue($value)
    {
        $this->value = $value;
    }
    public function getPaymentDate()
    {
        return $this->paymentDate;
    }
    public function setPaymentDate($paymentDate)
    {
        $this->paymentDate = $paymentDate;
    }
}
