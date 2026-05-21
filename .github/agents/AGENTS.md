# AGENTS.md

## Visão geral
- Este repositório é um **scaffold didático em MVC** para Web II, não uma aplicação finalizada. Muitos arquivos centrais são placeholders: `api/index.php`, `api/source/Config/Config.php`, `api/source/Core/Router.php`, `api/source/Controller/Api.php`, `api/source/Models/User.php`, `api/source/Support/Helpers.php`, `api/composer.json` e `data-base/dump.slq` estão vazios ou quase vazios.
- Escreva textos/documentação em **Português do Brasil**; mantenha **código, identificadores e nomes de arquivos em inglês** (conforme `.github/copilot-instructions.md`).

## Arquitetura a preservar
- O fluxo esperado de requisição está documentado em `README.MD`, `api/README.MD` e `api/source/README.MD`:
  `index.html` / JS das views → rewrite em `api/.htaccess` → `api/index.php` → `source\Core\Router` → `source\Controller\Api` → `source\Models\User` → MySQL.
- `api/` é território de backend apenas com JSON. `api/README.MD` diz explicitamente para abandonar hábitos de HTML/debug-print nessa camada; as respostas devem ser JSON.
- Os assets de front-end são separados por público em `views/assets/`: `_common/`, `public/`, `app/`, `admin/`. Coloque JS/CSS compartilhado em `_common/`; arquivos específicos de área devem ficar isolados.

## Realidade atual do código
- A única implementação PHP não trivial hoje está em `api/source/Core/Connect.php`.
- `Connect::getInstance()` é uma fábrica singleton de PDO e já espera constantes chamadas `CONF_DB_HOST`, `CONF_DB_PORT`, `CONF_DB_NAME`, `CONF_DB_USER`, `CONF_DB_PASS` vindas de configuração.
- `Connect.php` atualmente retorna JSON em falha de conexão e encerra; se você adicionar tratamento de erro em outros pontos, mantenha a saída da API consistente com esse estilo.
- Namespaces PHP seguem a estrutura de pastas (`source\Core`, `source\Controller`, `source\Models` etc.), alinhados aos exemplos de `api/source/README.MD`.

## Convenções específicas deste repositório
- Mantenha as fronteiras do MVC estritas, porque os READMEs ensinam isso de forma explícita:
  - Controllers orquestram/validam requisição/retornam JSON.
  - Models concentram SQL e acesso ao banco.
  - Views/assets consomem a API e não devem conter regra de negócio nem acesso a banco.
- Use prepared statements nos models; `api/source/Models/README.MD` ensina esse padrão com placeholders `:id`, `:name`, `:email`.
- Se adicionar helpers reutilizáveis de API no front-end, coloque em `views/assets/_common/scripts/` (a documentação usa `_common/scripts/api.js` como padrão).
- Se adicionar uploads/logs/cache, use `storage/`; não misture arquivos gerados com pastas de código-fonte.

## Fluxo de trabalho e integração
- Espera-se rewrite do Apache. `api/.htaccess` direciona requisições que não são arquivo/pasta para `index.php?route=/$1`; portanto, o roteamento backend deve respeitar o parâmetro `route`.
- O autoload do Composer é esperado pela documentação, mas `api/composer.json` está vazio hoje. Se implementar classes com namespace de verdade, provavelmente será necessário definir PSR-4 ali, em vez de assumir que já funciona.
- A configuração de banco também está apenas documentada, não implementada: `data-base/README.MD` descreve `dump.sql`, mas o arquivo versionado real é `data-base/dump.slq` e está vazio. Trate trabalho de schema como peça faltante, não como contrato existente.
- Não foram encontrados testes automatizados, configuração de linter ou scripts de build no workspace. Valide alterações rastreando manualmente o fluxo de entrada e verificando consistência de path/namespace.

## Formas seguras de evoluir o projeto
- Ao adicionar uma nova feature backend, conecte todas as camadas: rota em `Router.php`, handler em `Controller/Api.php`, acesso a dados em model e uso via fetch no arquivo apropriado em `views/assets/<area>/scripts/`.
- Ao adicionar configuração, prefira manter segredos de execução fora do VCS; `api/source/Config/README.MD` sugere usar config de exemplo e evitar credenciais reais em arquivos commitados.
- Use os exemplos didáticos existentes ao nomear itens: `User.php`, `/api/usuarios`, `_common/scripts/api.js`, `public/scripts/login.js`, `admin/scripts/users.js`.

