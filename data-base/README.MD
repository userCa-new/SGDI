# Banco de dados SGDI

O arquivo [`dump.sql`](./dump.sql) recria o schema `imobiliaria`, suas tabelas e registros demonstrativos.

> **Atenção:** cada execução apaga primeiro o banco `imobiliaria` inteiro. Todos os dados armazenados nele serão perdidos. Faça backup antes de executar; não use este dump para atualizar um banco com dados que deseja preservar.

## Importar pelo MySQL Workbench

1. Abra `dump.sql` em **File > Open SQL Script**.
2. Conecte-se ao servidor MySQL com um usuário que possa criar databases e tabelas.
3. Execute o script pelo botão de raio.
4. Configure as mesmas credenciais e o schema `imobiliaria` em `api/source/Config/Config.php`.

O dump é destinado a criar um banco limpo para desenvolvimento e testes. Para atualizar um banco existente sem perda de dados, não execute este dump; aplique migrations planejadas e validadas.

## Conteúdo do schema

O dump inclui todas as tabelas referenciadas pelos models da API: `user_type`, `users`, `properties`, `property_images`, `contracts`, `payments`, `appointments`, `faq_categories`, `faqs`, `chat` e `messages`. As chaves estrangeiras usam InnoDB; texto usa `utf8mb4`.

`users.photo` e `property_images` já estão incluídas. Os arquivos das imagens não ficam no banco: são armazenados em `api/uploads`.

## Contas demonstrativas

| Perfil | E-mail | Senha |
|---|---|---|
| Inquilinos e proprietários | `joao@email.com`, `maria@email.com`, `carlos@email.com`, `ana@email.com` | `123456` |
| Administrador | `admin@email.com` | `admin123` |

As senhas estão armazenadas como hashes compatíveis com `password_verify()`. São credenciais apenas para desenvolvimento; altere ou remova os usuários demonstrativos antes de disponibilizar o sistema.

Para bancos existentes, consulte [`migrations/2026-11-etapa07-upload-imagens.sql`](./migrations/2026-11-etapa07-upload-imagens.sql) antes de aplicar mudanças de upload.
