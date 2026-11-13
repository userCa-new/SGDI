-- Etapa 07 — Upload de imagens (MySQL 8)
-- Para bancos JÁ existentes. Bancos novos já recebem tudo de data-base/dump.sql.
-- Execute uma vez (use o banco do projeto: USE imobiliaria;).

-- 1) Foto do usuário: caminho relativo gerado por Upload (ex.: uploads/users/<hash>.jpg). Opcional.
--    Se a coluna NÃO existe:
ALTER TABLE users ADD COLUMN photo VARCHAR(255) DEFAULT NULL;
--    Se ela já existia como NOT NULL (versões antigas do dump), troque a linha acima por:
-- ALTER TABLE users MODIFY photo VARCHAR(255) DEFAULT NULL;

-- 2) Galeria do imóvel — relação 1:N: um imóvel tem 0..N imagens; cada imagem pertence a UM imóvel.
CREATE TABLE IF NOT EXISTS property_images (
    id_image INT AUTO_INCREMENT PRIMARY KEY,
    id_property INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_property_images_path (image_path),
    KEY idx_property_images_property (id_property),
    CONSTRAINT fk_property_images_property
        FOREIGN KEY (id_property)
        REFERENCES properties(id_property)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback (apaga também os metadados; os arquivos em api/uploads/ precisam ser removidos à parte):
-- DROP TABLE IF EXISTS property_images;
-- ALTER TABLE users DROP COLUMN photo;
