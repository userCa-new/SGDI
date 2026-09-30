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
