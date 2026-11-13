-- SGDI database schema and development seed data.
-- ATENCAO: executar este arquivo apaga todo o banco imobiliaria e seus dados.
DROP DATABASE IF EXISTS imobiliaria;

CREATE DATABASE imobiliaria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE imobiliaria;

CREATE TABLE user_type (
    id_user_type INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_user_type INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL, -- caminho relativo gerado por Upload (ex.: uploads/users/<hash>.jpg)

    FOREIGN KEY (id_user_type)
        REFERENCES user_type(id_user_type)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE properties (
    id_property INT AUTO_INCREMENT PRIMARY KEY,
    id_owner INT NOT NULL,

    location VARCHAR(150) NOT NULL,
    number_of_rooms INT NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    late_payment BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id_owner)
        REFERENCES users(id_user)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etapa 07: galeria do imóvel (relação 1:N). Cada imagem é um registro com id_property.
CREATE TABLE property_images (
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

CREATE TABLE contracts (
    id_contract INT AUTO_INCREMENT PRIMARY KEY,

    id_property INT NOT NULL,
    id_user INT NOT NULL,

    rent_value DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,

    status ENUM(
        'ACTIVE',
        'CLOSED',
        'PENDING'
    ) DEFAULT 'ACTIVE',

    FOREIGN KEY (id_property)
        REFERENCES properties(id_property)
        ON DELETE CASCADE,

    FOREIGN KEY (id_user)
        REFERENCES users(id_user)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id_payment INT AUTO_INCREMENT PRIMARY KEY,

    id_contract INT NOT NULL,

    pix VARCHAR(500),
    qr_code VARCHAR(500),
    receipt VARCHAR(120),

    `value` DECIMAL(10,2) NOT NULL,
    payment_date DATE,

    status ENUM(
        'PENDING',
        'PAID',
        'LATE'
    ) DEFAULT 'PENDING',

    FOREIGN KEY (id_contract)
        REFERENCES contracts(id_contract)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
    id_appointment INT AUTO_INCREMENT PRIMARY KEY,

    id_property INT NOT NULL,

    date DATE NOT NULL,
    observation VARCHAR(200),
    completed BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (id_property)
        REFERENCES properties(id_property)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faq_categories (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faqs (
    id_faq INT AUTO_INCREMENT PRIMARY KEY,

    id_category INT,

    question VARCHAR(255) NOT NULL,
    answer VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_category)
        REFERENCES faq_categories(id_category)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,

    id_property INT NOT NULL,

    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_property)
        REFERENCES properties(id_property)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
    id_message INT AUTO_INCREMENT PRIMARY KEY,

    id_chat INT NOT NULL,
    id_sender INT NOT NULL,

    message TEXT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_chat)
        REFERENCES chat(id_chat)
        ON DELETE CASCADE,

    FOREIGN KEY (id_sender)
        REFERENCES users(id_user)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_type (id_user_type, name)
VALUES
    (1, 'Tenant'),
    (2, 'Owner'),
    (3, 'Administrator');

INSERT INTO users (
    id_user,
    id_user_type,
    name,
    email,
    password
)
VALUES
    (1, 1, 'João Silva', 'joao@email.com', '$2y$12$7Xj3ORJYxieJxzNLnU.rnukW7aMzlz1itLE7Vn46fczXCTrtWbjL6'),
    (2, 1, 'Maria Souza', 'maria@email.com', '$2y$12$7Xj3ORJYxieJxzNLnU.rnukW7aMzlz1itLE7Vn46fczXCTrtWbjL6'),
    (3, 2, 'Carlos Pereira', 'carlos@email.com', '$2y$12$7Xj3ORJYxieJxzNLnU.rnukW7aMzlz1itLE7Vn46fczXCTrtWbjL6'),
    (4, 2, 'Ana Lima', 'ana@email.com', '$2y$12$7Xj3ORJYxieJxzNLnU.rnukW7aMzlz1itLE7Vn46fczXCTrtWbjL6'),
    (5, 3, 'Administrator', 'admin@email.com', '$2y$12$yvqYKSUqgYuuiYsBczarY.XvjicdOsmWLT0Zl5wViU4GZoRhTiUZK');

INSERT INTO properties (
    id_property,
    id_owner,
    location,
    number_of_rooms,
    availability,
    late_payment
)
VALUES
    (1, 3, 'Rua das Flores, 100', 2, TRUE, FALSE),
    (2, 3, 'Av. Brasil, 250', 3, TRUE, FALSE),
    (3, 4, 'Rua Independência, 45', 1, FALSE, FALSE);

INSERT INTO contracts (
    id_contract,
    id_property,
    id_user,
    rent_value,
    start_date,
    end_date,
    status
)
VALUES
    (1, 1, 1, 1200.00, '2025-01-01', NULL, 'ACTIVE'),
    (2, 3, 2, 1800.00, '2025-03-01', NULL, 'ACTIVE');

INSERT INTO payments (
    id_payment,
    id_contract,
    pix,
    qr_code,
    receipt,
    `value`,
    payment_date,
    status
)
VALUES
    (1, 1, 'pixjoao@email.com', 'qrcode_001', 'receipt001.pdf', 1200.00, '2025-06-05', 'PAID'),
    (2, 2, 'pixmaria@email.com', 'qrcode_002', NULL, 1800.00, NULL, 'PENDING');

INSERT INTO appointments (
    id_appointment,
    id_property,
    date,
    observation,
    completed
)
VALUES
    (1, 1, '2025-06-10', 'Troca de fechadura', TRUE),
    (2, 2, '2025-06-15', 'Pintura do quarto', FALSE);

INSERT INTO faq_categories (
    id_category,
    name,
    active
)
VALUES
    (1, 'Payments', TRUE),
    (2, 'Contracts', TRUE),
    (3, 'Properties', TRUE);

INSERT INTO faqs (
    id_faq,
    id_category,
    question,
    answer,
    active
)
VALUES
    (1, 1, 'How can I pay the rent?', 'Payment can be made via PIX or bank transfer.', TRUE),
    (2, 1, 'Can I delay the payment?', 'Late payments may incur penalties.', TRUE),
    (3, 2, 'How do I terminate a contract?', 'Contact the real estate agency to request termination.', TRUE),
    (4, 3, 'Can I visit a property before renting?', 'Yes, you can schedule a visit.', TRUE);

INSERT INTO chat (
    id_chat,
    id_property,
    creation_date
)
VALUES
    (1, 1, '2025-05-25 10:00:00'),
    (2, 3, '2025-05-25 11:00:00');

INSERT INTO messages (
    id_message,
    id_chat,
    id_sender,
    message,
    date_time
)
VALUES
    (1, 1, 1, 'Olá, este imóvel ainda está disponível?', '2025-05-26 10:00:00'),
    (2, 1, 3, 'Sim, continua disponível.', '2025-05-26 10:15:00'),
    (3, 2, 2, 'Gostaria de agendar uma visita.', '2025-05-27 14:00:00'),
    (4, 2, 4, 'Claro, podemos marcar para amanhã.', '2025-05-27 14:20:00');
