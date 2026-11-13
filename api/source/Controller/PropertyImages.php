<?php

namespace Source\Controller;

use RuntimeException;
use Source\Models\Propertie;
use Source\Models\PropertyImage;
use Source\Support\ImageStorage;
use Source\Support\Upload;


class PropertyImages extends Api
{
    private const MAX_FILES_PER_REQUEST = 10;
    private const MAX_IMAGES_PER_PROPERTY = 20;
    private const MAX_ALT_LENGTH = 255;
    private const FOLDER = "properties";

    public function listAll(array $data): void
    {
        $propertyId = $this->parseId($data["id"] ?? null);
        if ($propertyId === null) {
            $this->call(400, "bad_request", "O id do imóvel é obrigatório e deve ser um número inteiro positivo.", "error")->back();
            return;
        }

        $typeId = null;
        if ($this->authToken(2)) {
            $typeId = 2;
        } elseif ($this->authToken(1)) {
            $typeId = 1;
        } else {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return;
        }

        $property = new Propertie();
        if (!$property->selectById($propertyId)) {
            $this->call(404, "not_found", "Imóvel não encontrado.", "error")->back();
            return;
        }
        $allowed = $typeId === 2
            ? $property->getIdOwner() === $this->userAuthId
            : $property->belongsToTenant($propertyId, $this->userAuthId);
        if (!$allowed) {
            $this->call(404, "not_found", "Imóvel não encontrado para este usuário.", "error")->back();
            return;
        }

        $model = new PropertyImage();
        $rows = $model->listByProperty($propertyId);
        if ($rows === null) {
            $this->call(500, "internal_server_error", "Não foi possível listar as imagens do imóvel.", "error")->back();
            return;
        }

        $this->call(200, "success", "Galeria do imóvel", "success")->back([
            "id_property" => $propertyId,
            "total" => count($rows),
            "images" => array_map(fn($row) => $this->present($row), $rows),
        ]);
    }

    public function upload(array $data): void
    {
        $propertyId = $this->authorizeOwner($data);
        if ($propertyId === null) {
            return;
        }

       
        if (empty($_FILES) && (int) ($_SERVER["CONTENT_LENGTH"] ?? 0) > 0) {
            $this->call(
                413,
                "payload_too_large",
                "O envio excede o limite de " . ini_get("post_max_size") . " aceito pelo servidor (post_max_size).",
                "error",
            )->back();
            return;
        }

        $files = $this->collectFiles();
        $received = array_filter($files, fn($file) => ($file["error"] ?? null) !== UPLOAD_ERR_NO_FILE);
        if (count($received) === 0) {
            $this->call(400, "bad_request", "Selecione ao menos uma imagem para enviar.", "error")->back();
            return;
        }

        if (count($files) > self::MAX_FILES_PER_REQUEST) {
            $this->call(400, "bad_request", "Envie no máximo " . self::MAX_FILES_PER_REQUEST . " imagens por requisição.", "error")->back();
            return;
        }

        $altTexts = $this->collectAltTexts();
        if ($altTexts === null) {
            $this->call(400, "bad_request", "O texto alternativo deve ter no máximo " . self::MAX_ALT_LENGTH . " caracteres.", "error")->back();
            return;
        }

        $images = new PropertyImage();
        $current = $images->countByProperty($propertyId);
        $position = $images->nextPosition($propertyId);
        if ($current === null || $position === null) {
            $this->call(500, "internal_server_error", "Não foi possível consultar a galeria do imóvel.", "error")->back();
            return;
        }

        if ($current + count($files) > self::MAX_IMAGES_PER_PROPERTY) {
            $this->call(400, "bad_request", "Cada imóvel aceita no máximo " . self::MAX_IMAGES_PER_PROPERTY . " imagens (já possui {$current}).", "error")->back();
            return;
        }

        if (!$images->beginTransaction()) {
            $this->call(500, "internal_server_error", "Não foi possível iniciar a gravação das imagens.", "error")->back();
            return;
        }

       
        $uploader = new Upload(uploads_path(self::FOLDER));
        $savedFiles = [];
        $createdIds = [];

        foreach ($files as $index => $file) {
            try {
                $filename = $uploader->image($file);
            } catch (RuntimeException $exception) {
                $this->abortUpload($images, $savedFiles);
                $this->call(400, "bad_request", $this->fileLabel($file, $index) . ": " . $exception->getMessage(), "error")->back();
                return;
            }
            $savedFiles[] = $filename;

            $image = new PropertyImage(
                null,
                $propertyId,
                "uploads/" . self::FOLDER . "/" . $filename,
                $altTexts[$index] ?? null,
                $position + $index,
            );

            if (!$image->insert()) {
                error_log("Falha ao inserir property_images: " . $image->getErrorMessage());
                $this->abortUpload($images, $savedFiles);
                $this->call(500, "internal_server_error", "Não foi possível registrar as imagens no banco de dados. Nenhuma imagem foi salva.", "error")->back();
                return;
            }
            $createdIds[] = $image->getIdImage();
        }

        if (!$images->commit()) {
            $this->abortUpload($images, $savedFiles);
            $this->call(500, "internal_server_error", "Não foi possível concluir a gravação das imagens. Nenhuma imagem foi salva.", "error")->back();
            return;
        }

        $created = array_values(array_filter(
            $images->listByProperty($propertyId) ?? [],
            fn($row) => in_array((int) $row->id_image, $createdIds, true),
        ));

        $total = count($createdIds);
        $this->call(
            201,
            "success",
            $total === 1 ? "Imagem enviada com sucesso." : "{$total} imagens enviadas com sucesso.",
            "success",
        )->back([
            "id_property" => $propertyId,
            "total" => count($created),
            "images" => array_map(fn($row) => $this->present($row), $created),
        ]);
    }

    public function delete(array $data): void
    {
        $propertyId = $this->authorizeOwner($data);
        if ($propertyId === null) {
            return;
        }

        $imageId = $this->parseId($data["image_id"] ?? null);
        if ($imageId === null) {
            $this->call(400, "bad_request", "O id da imagem é obrigatório e deve ser um número inteiro positivo.", "error")->back();
            return;
        }

      
        $image = new PropertyImage();
        if (!$image->findInProperty($imageId, $propertyId)) {
            $this->call(404, "not_found", "Imagem não encontrada neste imóvel.", "error")->back();
            return;
        }
        $path = $image->getImagePath();

        if (!$image->deleteInProperty($imageId, $propertyId)) {
            $this->call(500, "internal_server_error", "Não foi possível remover a imagem.", "error")->back();
            return;
        }

       
        $fileRemoved = ImageStorage::remove($path);

        $this->call(
            200,
            "success",
            $fileRemoved ? "Imagem removida com sucesso." : "Imagem removida, mas o arquivo não pôde ser apagado do servidor.",
            "success",
        )->back([
            "id_image" => $imageId,
            "id_property" => $propertyId,
        ]);
    }


    private function authorizeOwner(array $data): ?int
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Token de autenticação inválido ou expirado.", "error")->back();
            return null;
        }

        $propertyId = $this->parseId($data["id"] ?? null);
        if ($propertyId === null) {
            $this->call(400, "bad_request", "O id do imóvel é obrigatório e deve ser um número inteiro positivo.", "error")->back();
            return null;
        }

        $property = new Propertie();
        if (!$property->selectById($propertyId)) {
            $this->call(404, "not_found", "Imóvel não encontrado.", "error")->back();
            return null;
        }

        if ($property->getIdOwner() !== $this->userAuthId) {
            $this->call(403, "forbidden", "Você não tem permissão para alterar as imagens deste imóvel.", "error")->back();
            return null;
        }

        return $propertyId;
    }

    private function parseId(mixed $value): ?int
    {
        $id = filter_var($value, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
        return $id === false ? null : $id;
    }

  
    private function collectFiles(): array
    {
        $field = $_FILES["images"] ?? $_FILES["image"] ?? null;
        if (!is_array($field) || !isset($field["name"])) {
            return [];
        }

        if (!is_array($field["name"])) {
            return [$field];
        }

        $files = [];
        foreach (array_keys($field["name"]) as $index) {
            $files[] = [
                "name" => $field["name"][$index],
                "type" => $field["type"][$index] ?? "",
                "tmp_name" => $field["tmp_name"][$index] ?? "",
                "error" => $field["error"][$index] ?? UPLOAD_ERR_NO_FILE,
                "size" => $field["size"][$index] ?? 0,
            ];
        }
        return $files;
    }

  
    private function collectAltTexts(): ?array
    {
        $raw = $_POST["alt_text"] ?? [];
        if (!is_array($raw)) {
            $raw = [$raw];
        }

        $texts = [];
        foreach ($raw as $index => $text) {
            if (!is_string($text)) {
                $texts[$index] = null;
                continue;
            }

            $clean = trim(preg_replace('/[\x00-\x1F\x7F]/u', "", $text) ?? "");
            if (mb_strlen($clean) > self::MAX_ALT_LENGTH) {
                return null;
            }
            $texts[$index] = $clean === "" ? null : $clean;
        }
        return $texts;
    }

    private function abortUpload(PropertyImage $images, array $savedFiles): void
    {
        $images->rollBack();
        foreach ($savedFiles as $filename) {
            ImageStorage::remove("uploads/" . self::FOLDER . "/" . $filename);
        }
    }

    private function fileLabel(array $file, int $index): string
    {
        $label = "Imagem " . ($index + 1);
        $name = $file["name"] ?? null;
        if (is_string($name)) {
            $safe = preg_replace('/[^\p{L}\p{N}._ -]/u', "", basename($name)) ?? "";
            $safe = mb_substr($safe, 0, 60);
            if ($safe !== "") {
                $label .= " ({$safe})";
            }
        }
        return $label;
    }

    private function present(object $row): array
    {
        return [
            "id_image" => (int) $row->id_image,
            "id_property" => (int) $row->id_property,
            "path" => $row->image_path,
            "url" => url($row->image_path),
            "alt_text" => $row->alt_text,
            "position" => (int) $row->position,
            "created_at" => $row->created_at,
        ];
    }
}
