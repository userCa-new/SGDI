<?php

namespace Source\Models;
use Source\Core\Connect;
use Source\Core\Model;

class Payment extends Model
{
    private ?int $idPayment;
    private ?int $idContract;
    private ?string $pix;
    private ?string $qr_code;
    private ?string $receipt;
    private ?float $value;
    private ?string $paymentDate;
    private ?string $status;

    public function __construct(
        ?int $idPayment = null,
        ?int $idContract = null,
        ?string $pix = null,
        ?string $qr_code = null,
        ?string $receipt = null,
        ?float $value = null,
        ?string $paymentDate = null,
        ?string $status = null,
    ) {
        $this->idPayment = $idPayment;
        $this->idContract = $idContract;
        $this->pix = $pix;
        $this->qr_code = $qr_code;
        $this->receipt = $receipt;
        $this->value = $value;
        $this->paymentDate = $paymentDate;
        $this->status = $status;

        $this->table = "payments";
        $this->primaryKey = "id_payment";
        $this->fillable = [
            "idContract",
            "pix",
            "qr_code",
            "receipt",
            "value",
            "paymentDate",
            "status",
        ];
    }

    public function getIdPayment(): ?int
    {
        return $this->idPayment;
    }

    public function setIdPayment(?int $idPayment): void
    {
        $this->idPayment = $idPayment;
    }

    public function getIdContract(): ?int
    {
        return $this->idContract;
    }

    public function setIdContract(?int $idContract): void
    {
        $this->idContract = $idContract;
    }

    public function getPix(): ?string
    {
        return $this->pix;
    }

    public function setPix(?string $pix): void
    {
        $this->pix = $pix;
    }

    public function getQrCode(): ?string
    {
        return $this->qr_code;
    }

    public function setQrCode(?string $qr_code): void 
    {
        $this->qr_code = $qr_code;
    }

    public function getReceipt(): ?string
    {
        return $this->receipt;
    }

    public function setReceipt(?string $receipt): void
    {
        $this->receipt = $receipt;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(?float $value): void
    {
        $this->value = $value;
    }

    public function getPaymentDate(): ?string
    {
        return $this->paymentDate;
    }
    public function setPaymentDate(?string $paymentDate): void
    {
        $this->paymentDate = $paymentDate;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }
}
