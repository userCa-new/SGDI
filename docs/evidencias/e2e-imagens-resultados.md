# Evidências automáticas — Etapa 07 (upload de imagens)

Chromium headless contra o servidor mock que imita o contrato da API (`views/tests/e2e/mock-uploads.mjs`). Imagens reais (PNG/JPG/WebP) enviadas por `<input type=file>`.

| # | Verificação | Resultado |
|---|---|---|
| 1 | Perfil: sem foto, mostra o ícone de reserva (inicial do nome) | ✅ |
| 2 | Perfil: regras de formato/limite visíveis | ✅ |
| 3 | Perfil: botão Enviar foto começa desabilitado | ✅ |
| 4 | Foto: bloqueia no frontend (texto renomeado .png) | ✅ |
| 5 | Foto: bloqueia no frontend (PDF) | ✅ |
| 6 | Foto: bloqueia no frontend (PNG > 5 MB) | ✅ |
| 7 | Foto: prévia aparece ANTES do envio e nada foi gravado ainda | ✅ |
| 8 | Foto: toast verde e imagem atual exibida (carregou de verdade) | ✅ |
| 9 | Foto: persistida no perfil do TOKEN (caminho relativo) e prévia some | ✅ |
| 10 | Foto: multipart com boundary gerado pelo navegador + Bearer | ✅ |
| 11 | Foto: o corpo NÃO carrega id de usuário (identidade vem do token) | ✅ |
| 12 | Foto: continua exibida depois de atualizar a página (GET /users/me) | ✅ |
| 13 | Foto: trocar a foto remove o arquivo antigo (só depois do UPDATE) | ✅ |
| 14 | Foto: arquivo rejeitado pelo BACKEND vira erro vermelho e não altera nada | ✅ |
| 15 | Foto: falha de persistência = erro, e o arquivo novo é removido (sem órfão) | ✅ |
| 16 | Galeria: regras e limites exibidos | ✅ |
| 17 | Galeria: antes de escolher o imóvel, só a orientação | ✅ |
| 18 | Galeria: imóvel sem imagens mostra a lista vazia | ✅ |
| 19 | Galeria: 2 prévias antes do envio; contador e botão habilitado | ✅ |
| 20 | Galeria: envio de 2 imagens (1 requisição multipart) → toast verde | ✅ |
| 21 | Galeria: 2 registros em property_images com id_property=1 e arquivos gravados | ✅ |
| 22 | Galeria: a requisição usou images[] em multipart com Bearer | ✅ |
| 23 | Galeria: imagens renderizadas e carregadas; prévias descartadas | ✅ |
| 24 | Galeria: texto alternativo é exibido como TEXTO (sem executar HTML) | ✅ |
| 25 | Galeria: depois de ATUALIZAR a página o imóvel e as 2 imagens voltam do banco (#galeria-1) | ✅ |
| 26 | Galeria: JPG e WebP também são aceitos; posições sequenciais 0..3 | ✅ |
| 27 | Galeria: remover UMA imagem preserva as demais (registros e arquivos) | ✅ |
| 28 | Galeria: arquivo rejeitado pelo backend → erro, NADA associado ao imóvel e nenhum arquivo órfão | ✅ |
| 29 | Galeria: após o erro a seleção continua para corrigir (2 cards) | ✅ |
| 30 | Galeria: descartar o inválido e reenviar funciona | ✅ |
| 31 | Galeria: falha no banco → erro e os arquivos já gravados são removidos | ✅ |
| 32 | Galeria: arquivos inválidos são barrados na seleção (texto renomeado, PDF, > 5 MB) | ✅ |
| 33 | Galeria: no máximo 10 imagens por envio | ✅ |
| 34 | Autorização (UI): imóvel de outro dono → lista visível, sem formulário de envio e sem botão remover | ✅ |
| 35 | Autorização (API): POST/DELETE em imóvel alheio = 403; imagem de outro imóvel pelo id errado = 404; sem token = 401; imóvel inexistente = 404 | ✅ |
| 36 | Autorização (API): nada foi alterado no imóvel alheio nem no imóvel 1 | ✅ |
| 37 | Inquilino: vê a galeria, sem formulário de envio nem remover | ✅ |
| 38 | Inquilino: POST de imagens de imóvel = 401 no backend | ✅ |
| 39 | Inquilino: qualquer perfil autenticado atualiza a própria foto | ✅ |
| 40 | Excluir o imóvel remove registros E arquivos da galeria (sem órfãos) | ✅ |
| 41 | Console do navegador sem erros inesperados | ✅ |

**41/41 verificações passaram.**
