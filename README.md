# SGDI — Sistema de Gestão de Imóveis

Aplicação MVC para administração de imóveis alugados, contratos e atendimentos, com painéis específicos para proprietários e inquilinos.

## Como executar

1. Importe `data-base/dump.sql` no MySQL Workbench e configure a conexão em `api/source/Config/Config.php`. **Atenção:** o script apaga e recria o banco `imobiliaria`, removendo todos os dados atuais.
2. Abra `http://localhost/SGDI/views/assets/public/login.html`. As páginas usam módulos ES e precisam ser servidas por HTTP.


## Módulos e permissões

| Recurso | Proprietário | Inquilino |
|---|---|---|
| Imóveis e galeria | Cria, consulta, edita e remove seus imóveis e imagens | Consulta imóveis associados a contratos ativos e suas imagens |
| Contratos | Cria, consulta, edita e remove contratos dos próprios imóveis | Consulta seus próprios contratos |
| Atendimentos | Consulta solicitações dos próprios imóveis e conclui/reabre solicitações | Cria e cancela solicitações ligadas a uma locação ativa |
| Perfil | Atualiza os próprios dados e foto | Atualiza os próprios dados e foto |

As permissões são verificadas no backend pelo token e pela relação entre usuário, imóvel e contrato; ocultar controles na interface não substitui a autorização da API.

## Arquitetura

- **Backend:** PHP MVC em `api/source/Controller`, `Models`, `Core` e `Support`; roteamento em `api/index.php`.
- **Frontend:** páginas em `views/assets/app`; os scripts de cada painel orquestram os serviços e componentes compartilhados.
- **Serviços:** `PropertyService`, `PropertyImageService`, `ContractService` e `AppointmentService` reutilizam `HttpClientBase`.
- **Entidades:** `Property`, `PropertyImage`, `Contract` e `Appointment` convertem e validam os dados da API.
- **Dados:** as tabelas existentes são mantidas; não há migration nem exclusão de registros nesta redistribuição.

### Endpoints integrados aos painéis

| Recurso | Operações |
|---|---|
| `properties` | `/properties/mine`, `insert`, `update/{id}`, `delete/{id}` |
| Imagens | `/properties/{id}/images` para consulta, envio multipart e remoção |
| `contracts` | `/contracts/listAll`, `insert`, `update/{id}`, `delete/{id}` |
| `appointments` | `/appointments/listAll`, `insert`, `update/{id}`, `delete/{id}` |
| Inquilinos | `/users/tenants`, disponível apenas ao proprietário |

O acesso a imóveis e galerias de imagens é limitado ao proprietário responsável ou ao inquilino com contrato ativo associado. O envio de imagens valida tipo e tamanho, e a remoção limpa os arquivos da galeria após excluir os registros.
