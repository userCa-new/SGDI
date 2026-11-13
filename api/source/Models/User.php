<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;

class User extends Model
{
    private ?int $idUser;
    private ?int $idUserType;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $active;

    private ?string $photo;
    private ?string $token = null;

    public function __construct(
        ?int $idUser = null,
        ?int $idUserType = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
    ) {
        $this->idUser = $idUser;
        $this->idUserType = $idUserType;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;

        $this->table = "users"; // nome da tabela do banco
        $this->primaryKey = "id_user"; // nome da chave primária da tabela
        $this->fillable = ["idUserType", "name", "email", "password", "photo"]; // camelCase
    }

    public function getIdUser(): ?int
    {
        return $this->idUser;
    }

    public function setIdUser(?int $idUser): void
    {
        $this->idUser = $idUser;
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

    public function setPhoto(?string $photo): void 
    {
        $this->photo = $photo;
    }

    public function getPhoto(): ?string 
    {
        return $this->photo;
    }

    
    public function updatePhoto(int $idUser, string $photo): bool
    {
        try {
            $query = "UPDATE {$this->table} SET photo = :photo WHERE id_user = :idUser";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":photo", $photo);
            $stmt->bindValue(":idUser", $idUser, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = "Perfil não encontrado ou foto não alterada.";
                return false;
            }

            $this->idUser = $idUser;
            $this->photo = $photo;
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Não foi possível atualizar a foto do perfil.";
            return false;
        }
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

    public function login(string $email, string $password): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
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

        $this->idUser = $user->id_user;
        $this->idUserType = $user->id_user_type;
        $this->name = $user->name;
        $this->email = $user->email;

        $jwt = new JWTToken();
        $this->token = $jwt->encode([
            "id" => $user->id_user,
            "name" => $user->name,
            "email" => $user->email,
        ]);

        return true;
    }

    public function permissionVerify(string $email, int $typeId): bool
    {
        $query = "SELECT *
              FROM users
              WHERE email = :email
              AND id_user_type = :typeId";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function listTenants(): ?array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT id_user, name FROM {$this->table}
                 WHERE id_user_type = 1 ORDER BY name, id_user"
            );
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\PDOException $exception) {
            error_log($exception->getMessage());
            $this->errorMessage = "Não foi possível carregar a lista de inquilinos.";
            return null;
        }
    }

    public function isTenant(int $userId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT 1 FROM {$this->table}
                 WHERE id_user = :user_id AND id_user_type = 1 LIMIT 1"
            );
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        } catch (\PDOException $exception) {
            error_log($exception->getMessage());
            return false;
        }
    }
}
