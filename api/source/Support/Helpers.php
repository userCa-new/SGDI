<?php

function url(?string $path = null): string
{
    if($_SERVER['HTTP_HOST'] === "localhost")
    {
        if($path){
            return CONF_URL_TEST . "/" . ($path[0] == "/" ? mb_substr($path, 1) : $path);
        }
        return CONF_URL_TEST;
    }
    if($path)
    {
        return CONF_URL_BASE . "/" . ($path[0] == "/" ? mb_substr($path, 1) : $path);
    }
    return CONF_URL_BASE;
}
/**
 * Caminho físico da pasta de uploads (api/uploads/{pasta}).
 * Fica dentro de api/ para que url("uploads/...") — http://localhost/SGDI/api/uploads/... —
 * resolva para o arquivo gravado (o .htaccess da API serve arquivos existentes).
 */
function uploads_path(string $folder = ""): string
{
    $base = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads";
    return $folder === "" ? $base : $base . DIRECTORY_SEPARATOR . trim($folder, "/\\");
}
