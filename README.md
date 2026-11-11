# SGDI — Sistema de Gestão de Imóveis

> **Branch `javascript-poo` — Etapa 06:** frontend refatorado para JavaScript orientado a objetos
> (POO clássica com `class` + POO prototípica com `Object.create`), sem alterar as rotas do backend.

## Como executar

1. Banco: importe `data-base/dump.slq` no MySQL (`imobiliaria`); ajuste `api/source/Config/Config.php`.
2. Backend: `cd api && composer install` (a pasta `vendor/` já vem no repositório). Coloque o projeto em
   `htdocs/SGDI` (Apache + `mod_rewrite`) para que a API responda em `http://localhost/SGDI/api`.
3. Frontend: abra `http://localhost/SGDI/views/assets/public/login.html`.
   **Os scripts são módulos ES (`type="module"`): é preciso servir por HTTP; abrir o arquivo com `file://` não funciona.**
4. Mesma origem: front e API em `http://localhost` evitam CORS. Se o front for servido em outra porta, o backend
   precisa liberar o cabeçalho `Authorization` explicitamente (o curinga `*` não o cobre).

Fluxo de demonstração: `cadastro.html` → `login.html` → `app/manage.html` (CRUD) → **Sair**.
Proprietário e Inquilino têm operações diferentes, porque os controllers exigem perfis diferentes (tabela abaixo).

## Testes e evidências

```bash
node views/tests/poo.test.mjs                      # 13 testes unitários (entidades, serviços, Toast) — sem dependências
node views/tests/e2e/run-e2e.mjs                   # 39 verificações E2E em Chromium headless (porta 80)
```

O E2E usa `views/tests/e2e/mock-api.mjs`, um **servidor mock que imita o contrato dos controllers PHP**
(envelope, perfis 1/2, corpo `x-www-form-urlencoded`). Ele **não é** o backend real: as evidências em
[`docs/evidencias/`](docs/evidencias) (`e2e-resultados.md` e capturas de tela) comprovam o comportamento do frontend
contra esse contrato; a execução contra o PHP + MySQL da equipe deve ser registrada nas capturas finais da entrega.

## Arquitetura

```
views/assets/
├── _common/
│   ├── scripts/storage.js            SessionStorage: token + usuário (sem senha) no localStorage
│   ├── classes/                      ← POO clássica (class)
│   │   ├── HttpClientBase.js         URL base, cabeçalhos, Bearer, get/post/put/delete, envelope
│   │   ├── entities/                 Entity (base) → Property, Contract, Appointment, User, Faq
│   │   └── services/                 CrudService → PropertyService, ContractService, AppointmentService, FaqService
│   │                                 UserService (cadastro, login, perfil)   — todos herdam HttpClientBase
│   └── prototypes/                   ← POO prototípica (Object.create)
│       ├── Toast.js                  mensagens success/warning/error
│       ├── FormController.js         serializar, preencher, validar, limpar, loading
│       └── CrudController.js         listar, editar, salvar, excluir com confirmação
├── public/scripts/  login.js · cadastro.js · faq.js         (telas: só compõem as peças acima)
└── app/scripts/     manage.js · auth-guard.js               (tela de CRUD integrada)
```

Camadas e responsabilidades: **tela** (`manage.js`) só compõe → **CrudController** coordena →
**Service** fala HTTP e devolve entidades → **Entity** valida e converte payload ↔ objeto.
Serviços não tocam em HTML; telas não chamam `fetch`.

### Entidades × tabelas × rotas (contrato real dos controllers)

| Entidade (classe) | Tabela | Rotas usadas | Perfil exigido no backend |
|---|---|---|---|
| `Property` (principal) | `properties` | `GET listAll`, `GET list/{id}`, `POST insert`, `PUT update/{id}`, `DELETE delete/{id}` | leitura livre; escrita **Proprietário (2)** |
| `Contract` | `contracts` | idem em `/contracts` | leitura livre; escrita **Proprietário (2)** |
| `Appointment` | `appointments` | idem em `/appointments` | `insert` e `delete`: **Inquilino (1)**; `update`: **Proprietário (2)** |
| `User` | `users` | `POST /users/register`, `POST /users/login`, `PUT /users/update` | register/login livres; update: perfil 1 ou 2 |
| `Faq` | `faqs` | `GET /faqs/list` | livre |

Adaptações ao contrato (o frontend segue a API, não cria regra paralela):
o login é **POST**; o corpo é `x-www-form-urlencoded` (o router PHP não lê JSON); o `PUT` de imóvel envia também
`id_property`; o `PUT` de atendimento aceita **somente `completed`** (por isso a ação é "Concluir/Reabrir");
`end_date` é obrigatório em contratos porque a API o exige; `id_owner`/`id_user` vêm do token, nunca do formulário.
Os botões escondidos por perfil são só conveniência: a barreira real é o `authToken()` do backend.

### Formato de resposta e Toast

Todas as respostas são normalizadas para `{ code, type, status, message, data }`. 4xx/5xx com envelope válido são
devolvidos ao chamador (`type: "error"`); falha de rede ou corpo que não é JSON lança `ApiError` — nada é silenciado.
O `Toast` aceita respostas com ou sem `data`, usa **só** `message` (nunca imprime `data`), cai numa mensagem padrão se
`message` faltar e trata qualquer outra forma como *"Resposta inesperada do servidor"* (vermelho + `console.error`).
Cores: `success` verde · `warning` amarelo · `error` vermelho. Erros de validação do cliente (`TypeError`/`RangeError`
lançados pelos setters) aparecem em amarelo. Há estados de **carregamento** (botão desabilitado + "Carregando…"),
**lista vazia** e **erro** em todas as listas.

## Encapsulamento, herança, composição e protótipos

**Encapsulamento.** Cada entidade guarda seu estado em campos privados (`#location`, `#password`…), acessíveis só por
getters/setters que validam (`requiredText`, `nonNegativeNumber`, `isoDate`, enum de status). Nenhum campo é visível em
`Object.keys(entidade)`. A senha de `User` é *write-only*: existe setter, não existe getter, e ela não entra em
`toJSON()` nem na sessão salva. `HttpClientBase` esconde URL, cabeçalhos e token em campos privados.

**Herança.** `Entity` é base de todas as entidades (`fromApiList`, `isNew`, validadores). `CrudService` e `UserService`
**estendem `HttpClientBase`** e reaproveitam `get/post/put/delete`, URL base, cabeçalhos e Bearer; `PropertyService`,
`ContractService`, `AppointmentService` e `FaqService` estendem `CrudService` só para declarar entidade/recurso (e o
`AppointmentService` sobrescreve `updatePayload` para enviar apenas `completed`).

**Composição.** O `CrudController` *tem* um `service`, um `FormController`, um `Toast` e uma lista de colunas; não herda
de nenhum deles. `manage.js` monta três CRUDs diferentes trocando apenas a configuração.

**Protótipos (o que é compartilhado).** `Toast`, `FormController` e `CrudController` são objetos criados por
`Object.create(Prototype, estadoPróprio)`, sem segunda `class`.
- *Compartilhado, existe uma única vez no protótipo:* todos os **métodos** (`Toast.show/fromResponse/fromError/clear/normalize`;
  `FormController.serialize/fill/clear/validate/setLoading/onSubmit`; `CrudController.init/load/render/edit/save/remove/…`).
- *Próprio de cada objeto:* apenas o **estado** (`container`, `duration`, `region`, `timer`; `form`, `rules`; `service`,
  `columns`, `items`, `editing`…).
- *Demonstração:* em `manage.js` há dois `Toast` (`pageToast` global e `profileToast` inline), três `FormController` e
  três `CrudController`. A seção "Evidência" da própria página (e `poo.test.mjs`) mostra `pageToast !== profileToast`,
  `Object.getPrototypeOf` igual, `pageToast.show === profileToast.show` e `Object.hasOwn(pageToast, "show") === false`.

## Evidências do CRUD (resumo do E2E)

| Operação | Tela / rota | Resultado verificado |
|---|---|---|
| Cadastro | `cadastro.html` → `POST /users/register` | toast verde com a mensagem da API; sem senha no storage |
| Login | `login.html` → `POST /users/login` | token + usuário (sem senha) no `localStorage`; erro 401 → toast vermelho e nenhuma sessão |
| Rota protegida | `manage.html` → escritas com `Authorization: Bearer` | token inválido → 401 exibido em vermelho, nada gravado |
| Imóvel C/R/U/D | `POST insert`, `GET listAll`, `PUT update/{id}`, `DELETE delete/{id}` | linhas recarregadas da API; exclusão pede confirmação |
| Contrato C/R/U | `/contracts/*` | validação `fim ≥ início` em amarelo antes de qualquer requisição |
| Atendimento C/R/U/D | Inquilino cria/exclui; Proprietário conclui | formulários e botões conforme perfil |
| Perfil | `PUT /users/update` | toast inline; senha limpa do formulário |
| Logout | botão **Sair** | sessão removida; `manage.html` sem sessão volta ao login |
| Resposta inesperada | corpo com lixo antes do JSON | toast vermelho + `console.error` |

## Observações e limites conhecidos

- `app/owner.js` e `app/tenant.js` (painéis da Etapa 05) **continuam usando `localStorage` como mock** de pagamentos,
  chat e manutenção. Não foram reescritos: o CRUD real está em `app/manage.html`, ligado por link nas duas telas.
- **Correções feitas fora do JS:** removidos dois `var_dump()` de depuração do backend
  (`Users::update` e `Contracts::update`) que imprimiam texto antes do JSON e quebravam a resposta do `PUT`.
  Nenhuma rota foi criada ou alterada.
- **Correção de comportamento na FAQ:** `faq.js` distribuía as perguntas pelo `id_faq`; agora usa `id_category`.
- `logout` só limpa a sessão local (a API não tem rota de logout). Token de 90 min; expirado → a próxima escrita devolve 401.
- Bugs do backend observados e **não** alterados: `Payments::register` lê `$data["paymentDate"]` mas valida
  `payment_date`; por isso Pagamentos não foi usado como entidade do CRUD. `Chat`, `Message`, `Payment` e `FaqCategory`
  em `classes/entities/` são os arquivos antigos da Etapa 05 (não usados nas telas e não refatorados).
- `HttpClientBase` foi movido de `_common/scripts/` para `_common/classes/` e `_common/class/` virou `_common/classes/entities/`,
  conforme o caminho pedido no enunciado.

---

# Etapa 07 — Upload de imagens (branch `upload-imagens`)

Dois casos, ambos com `multipart/form-data` (sem Base64/JSON), persistidos no banco + sistema de arquivos e
demonstráveis após atualizar a página:

| Caso | Tela | Rotas (contrato completo em [`api/README.MD`](api/README.MD#upload-de-imagens-etapa-07)) |
|---|---|---|
| **A. Foto do usuário logado** | `app/manage.html` → *Meu perfil* | `GET /users/me` · `POST /users/photo` (campo `photo`) |
| **B. Galeria do imóvel (1:N)** | `app/manage.html` → *Galeria de imagens* | `GET /properties/{id}/images` · `POST /properties/{id}/images` (`images[]`, `alt_text[]`) · `DELETE /properties/{id}/images/{image_id}` |

> "Produto" do enunciado = **imóvel** (`properties`), a entidade principal deste projeto.

## Como executar

1. **Banco:** banco novo → importe `data-base/dump.slq` (já tem `users.photo` e `property_images`).
   Banco existente → execute `data-base/migrations/2026-11-etapa07-upload-imagens.sql`.
2. **PHP:** extensões `fileinfo`, `mbstring` e `gd` (ou equivalente para `getimagesize`) habilitadas.
   Limites: `upload_max_filesize=5M`, `post_max_size=55M`, `max_file_uploads=10` — já definidos em `api/.htaccess`
   (mod_php) e `api/.user.ini` (FPM/CGI). Se usar outro servidor, ajuste o `php.ini` com esses valores
   (`post_max_size` precisa comportar 10 × 5 MiB + campos; estourar esse limite resulta em **413**).
3. **Pasta de uploads:** `api/uploads/{users,properties}` precisa de **permissão de escrita** para o usuário do servidor web
   (no Linux: `chmod -R u+w api/uploads` / `chown www-data`). O conteúdo gravado não vai para o Git (`api/uploads/.gitignore`);
   `api/uploads/.htaccess` desliga a execução de scripts e a listagem.
4. Sirva o front por HTTP (módulos ES) em `http://localhost/SGDI/views/assets/public/login.html`, entre como **Proprietário**
   e abra **Gestão (API)**. Imagem enviada vira `http://localhost/SGDI/api/uploads/...`.

## Arquitetura (resumo)

```
Backend                                         Frontend
Controller\PropertyImages ── valida/coordena     prototypes/GalleryController  (Object.create) ─┐
Models\PropertyImage ─────── prepared statements   prototypes/PhotoController    (Object.create) ─┤ usam
Support\Upload ───────────── grava + valida        classes/services/PropertyImageService ─ extends HttpClientBase
Support\ImageStorage ─────── remove arquivos       classes/services/UserService (me, uploadPhoto)
                             gerenciados           classes/HttpClientBase.postForm(FormData) — sem Content-Type manual
                                                   classes/entities/PropertyImage · scripts/image-rules.js
```

- **Controller × Model:** o controller autentica, autoriza (token de Proprietário **e** posse do imóvel), valida e chama
  `Upload::image()` por arquivo; o model só persiste metadados (transação + prepared statements).
- **Consistência arquivo × banco:** envio é tudo-ou-nada (rollback + remoção dos arquivos gravados); na remoção, o registro
  sai primeiro e o arquivo depois; ao excluir o imóvel os arquivos da galeria também são apagados; a foto antiga só é
  apagada depois do `UPDATE` da nova.
- **Front:** valida tipo/extensão/tamanho **e a assinatura (magic bytes)** antes de enviar, mostra prévia (com texto
  alternativo editável), estados de carregamento/vazio/sucesso/erro, e só aceita URLs de imagem da própria API.
  Textos vão ao DOM com `textContent` (o E2E injeta `<img onerror>` no texto alternativo e confirma que não executa).
  O imóvel aberto fica em `#galeria-ID`: atualizar a página recarrega a galeria **do banco**.

## Correções necessárias no backend (encontradas ao integrar)

| Arquivo | Problema | Correção |
|---|---|---|
| `Support/Upload.php`, `POST /users/photo` | o projeto não trazia a classe nem a rota/coluna | adicionados (versão do curso) |
| `Models/User::updatePhoto` | usava a coluna inexistente `active` e só atualizava Proprietário (`id_user_type = 2`) | `WHERE id_user = :idUser` (qualquer perfil autenticado) |
| `Users::uploadPhoto` | exigia `authToken(2)`; gravava em `<raiz>/uploads`, mas `url("uploads/...")` aponta para `api/uploads` | aceita Inquilino e Proprietário; pasta `api/uploads` (`uploads_path()`) |
| `dump.slq` | `users.photo VARCHAR(255) NOT NULL` sem default quebraria o cadastro | `DEFAULT NULL` |
| `Models/Propertie` | gravava `id_user`, mas a coluna de `properties` é `id_owner` | renomeado para `idOwner` (necessário para a posse do imóvel) |
| `Controller/Properties` | mensagem "Atendimento cadastrado" ao criar imóvel; exclusão deixava arquivos órfãos | mensagem corrigida; apaga os arquivos da galeria |

## Testes e evidências

```bash
node views/tests/imagens.test.mjs                  # 8 testes unitários da etapa 07
node views/tests/poo.test.mjs                      # 13 testes da etapa 06
node views/tests/e2e/run-e2e.mjs                   # 39 verificações (etapa 06)
node views/tests/e2e/run-e2e-imagens.mjs           # 41 verificações da etapa 07 (Chromium headless, porta 80)
```

Evidências em [`docs/evidencias/`](docs/evidencias): `e2e-imagens-resultados.md` (tabela completa),
`07a-foto-previa.png`, `07b-foto-apos-reload.png`, `08a-galeria-2-imagens.png` (imóvel com 2 imagens),
`08b-galeria-apos-reload.png` (**mesma galeria após atualizar a página**), `08c-erro-backend.png`.

> **Limite desta verificação:** o E2E roda contra `views/tests/e2e/mock-uploads.mjs`, um **mock em Node que reproduz o
> contrato e as regras dos controllers PHP**; o código PHP novo **não foi executado** no ambiente em que foi escrito
> (sem PHP/MySQL). Antes de entregar, rode o fluxo contra o Apache + MySQL da equipe e anexe as capturas reais
> (foto do perfil, galeria com 2+ imagens, recarga da página, linhas de `property_images` no banco).
