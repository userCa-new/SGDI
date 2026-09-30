# Evidências automáticas (E2E)

Executado com Chromium headless contra um servidor mock que imita o contrato da API (`views/tests/e2e/mock-api.mjs`).

| # | Verificação | Resultado |
|---|---|---|
| 1 | FAQ: itens agrupados por id_category | ✅ passou |
| 2 | FAQ: HTML da resposta é texto (sem injeção) | ✅ passou |
| 3 | FAQ: clique expande resposta (delegação de eventos) | ✅ passou |
| 4 | FAQ: nenhum atributo onclick no DOM | ✅ passou |
| 5 | Cadastro: toast verde com a mensagem da API | ✅ passou |
| 6 | Cadastro: usuário gravado com tipo 1 | ✅ passou |
| 7 | Cadastro: senha não vai para sessionStorage | ✅ passou |
| 8 | Login inválido: toast vermelho com mensagem do backend | ✅ passou |
| 9 | Login inválido: nenhuma sessão criada | ✅ passou |
| 10 | Login: toast verde | ✅ passou |
| 11 | Login: token salvo e usuário sem senha | ✅ passou |
| 12 | Login: redireciona o Proprietário para owner.html | ✅ passou |
| 13 | Manage: sessão exibe o nome | ✅ passou |
| 14 | Manage: lista inicial de imóveis vem da API | ✅ passou |
| 15 | Imóvel CREATE: toast verde com a mensagem da API | ✅ passou |
| 16 | Imóvel CREATE: id_owner vem do token e linha aparece | ✅ passou |
| 17 | Imóvel EDIT: formulário preenchido | ✅ passou |
| 18 | Imóvel UPDATE: PUT com id_property gravou no banco | ✅ passou |
| 19 | Imóvel UPDATE: tabela recarregada da API | ✅ passou |
| 20 | Validação: campo vazio -> toast amarelo, sem requisição de escrita | ✅ passou |
| 21 | Imóvel DELETE com confirmação | ✅ passou |
| 22 | Contrato: data final < inicial -> toast amarelo | ✅ passou |
| 23 | Contrato CREATE: gravado (end_date enviado, id_user do token) | ✅ passou |
| 24 | Contrato: valor formatado em R$ | ✅ passou |
| 25 | Contrato UPDATE | ✅ passou |
| 26 | Atendimento: formulário de criação oculto para Proprietário | ✅ passou |
| 27 | Atendimento UPDATE: PUT só com completed | ✅ passou |
| 28 | Perfil: PUT /users/update com toast inline verde | ✅ passou |
| 29 | Perfil: senha limpa do formulário e ausente do localStorage | ✅ passou |
| 30 | Protótipos: todos os testes de identidade = true | ✅ passou |
| 31 | Resposta inesperada: toast vermelho, sem silenciar | ✅ passou |
| 32 | Resposta inesperada: erro registrado no console | ✅ passou |
| 33 | 401: toast vermelho com mensagem do backend e nada é gravado | ✅ passou |
| 34 | Logout: sessão removida e volta ao login | ✅ passou |
| 35 | Guarda: sem sessão, manage.html redireciona ao login | ✅ passou |
| 36 | Inquilino: formulários de imóvel/contrato ocultos; atendimento visível | ✅ passou |
| 37 | Atendimento CREATE (Inquilino) | ✅ passou |
| 38 | Inquilino não vê botão Concluir | ✅ passou |
| 39 | Atendimento DELETE (Inquilino) com confirmação | ✅ passou |

**39/39 verificações passaram.**
