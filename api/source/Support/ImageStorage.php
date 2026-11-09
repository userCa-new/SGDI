<?php

namespace Source\Support;

/**
 * Remoção segura de imagens gravadas pela aplicação (via Upload::image()).
 * Só apaga arquivos cujo caminho relativo siga exatamente o padrão gerado por
 * Upload (uploads/{users|properties}/<32 hex>.<jpg|png|webp>); qualquer outro
 * valor vindo do banco é ignorado, evitando path traversal.
 */
class ImageStorage
{
    private const PATTERN = '/\Auploads\/(users|properties)\/([a-f0-9]{32}\.(?:jpg|png|webp))\z/';

    public static function isManaged(?string $relativePath): bool
    {
        return $relativePath !== null && preg_match(self::PATTERN, $relativePath) === 1;
    }

    /** @return bool true se o arquivo não existe mais ao final; false se não foi possível apagar */
    public static function remove(?string $relativePath): bool
    {
        if ($relativePath === null || preg_match(self::PATTERN, $relativePath, $matches) !== 1) {
            return false;
        }

        $file = uploads_path($matches[1]) . DIRECTORY_SEPARATOR . $matches[2];
        if (!is_file($file)) {
            return true;
        }

        if (!unlink($file)) {
            error_log("Não foi possível remover o arquivo de imagem: " . $matches[1] . "/" . $matches[2]);
            return false;
        }

        return true;
    }
}
