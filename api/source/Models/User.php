<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;

class User extends Model
{
    private ?int $id;
    private ?int $idUserType;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $active;

    private ?string $token = null;

    public function __construct(
        ?int $id = null,
        ?int $idUserType = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
    ) {
        $this->id = $id;
        $this->idUserType = $idUserType;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;

        $this->table = "users"; // nome da tabela do banco
        $this->primaryKey = "id_user"; // nome da chave primária da tabela
        $this->fillable = ["idUserType", "name", "email", "password"]; // camelCase
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getIdUserType(): ?int
    {
        return $this->idUserType;
    }

    public function setIdUserType(?int $idUserType): void
    {
        $this->idUserType = $idUserType;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): void
    {
        $this->password = $password;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function insert(): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $this->errorMessage = "Email já cadastrado";
            return false;
        }
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        if (!parent::insert()) {
            $this->errorMessage = "Algo deu errado";
            return false;
        }
        return true;
    }

    public function login(
        string $email,
        string $password,
        int $typeId = 2,
    ): bool {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND id_user_type = :idUserType";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":idUserType", $typeId);
        $stmt->execute();
        if ($stmt->rowCount() == 0) {
            $this->errorMessage = "Email não cadastrado";
            return false;
        }
        $user = $stmt->fetch();
        if (!password_verify($password, $user->password)) {
            $this->errorMessage = "Senha incorreta";
            return false;
        }
        $this->id = $user->id_user;
        $this->idUserType = $user->id_user_type;
        $this->name = $user->name;
        $this->email = $user->email;
        var_dump("cheguei aqui");
        $jwt = new JWTToken();
        var_dump("cheguei aquiaa");
        // definir quais informações irão par o payload do token
        $this->token = $jwt->encode([
            "id" => $user->id_user,
            "name" => $user->name,
            "email" => $user->email,
        ]);
        var_dump("token criado");
        return true;
    }

    public function permissionVerify(string $email, $typeId): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND id_user_type = :typeId";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);
        $stmt->execute();
        if ($stmt->rowCount() == 0) {
            return false;
        }
        return true;
    }
}
