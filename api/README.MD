# API - Sistema de Imóveis

## Descrição


Ela permite o gerenciamento de:

- Usuários
- FAQs
- Agendamentos
- Imóveis
- Pagamentos
- Contratos
- Mensagens
- Chats

---

## URL Base

```
http://localhost/SGDI/api
```

---

## HTTPS (Clone)
```bash
git clone https://github.com/userCa-new/SGDI.git
```

# Usuários

## Registrar usuário

**POST**

```
/users/register
```

### Corpo da requisição

```json
{
    "type_user": 2,
    "name":"caca",
    "email":"caca@email.com",
    "password":"123"
}
```

### Resposta

```json
{
  "code": 201,
  "type": "created",
  "status": "success",
  "message": "Usuário inserido com sucesso",
  "data": {
    "id": 2,
    "name": "caca",
    "email": "caca@gmail.com"
  }
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Usuário inserido com sucesso.|
|400|error|bad_request|A senha é obrigatória.|
|400|error|bad_request|Nome e e-mail são obrigatórios. O e-mail deve ser válido.|
|500|error|internal_server_error|Erro ao cadastrar o usuário.|

---

## Login

**POST**

```
/users/login
```

### Corpo da requisição

```json
{
    "email":"caca@email.com",
    "password":"123"
}
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Usuário logado com sucesso",
  "data": {
    "id": 2,
    "name": "caca",
    "token": "xxx"
  }
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário logado com sucesso.|
|400|error|bad_request|E-mail e senha são obrigatórios. O e-mail deve ser válido.|
|401|error|unathorized|A senha é obrigatória.|


---

## Atualizar usuário

**PUT**

```
/users/update
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário atualizado com sucesso.|
|401|error|unathorized|Usuário não está autenticado (sem token ou token inválido).|

---

# Administrador

## Registrar administrador
**POST**
```
/users/register-admin
```


---

## Login administrador
**POST**
```
/users/login-admin
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário logado com sucesso.|
|400|error|bad_request|E-mail e senha são obrigatórios. O e-mail deve ser válido.|
|401|error|unathorized|A senha é obrigatória.|

---

## Atualizar administrador
**PUT**
```
/users/update-admin
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário atualizado com sucesso.|
|401|error|unathorized|Usuário não está autenticado (sem token ou token inválido).|


---

# FAQs

## Listar FAQs
**GET**
```
/faqs/list
```

### Resposta

```json

    {
        "id":1,
        "question":"Pergunta",
        "answer":"Resposta"
    }

```

---

## Inserir FAQ
**POST**
```
/faqs/
```

---

# Atendimentos


### Cadastrar Atendimento

**POST**

```http
/appointment/register
```

#### Corpo da requisição

```json
{
  "id_property": 2,
  "date": "2025-10-10",
  "observation": "Troca de fechadura",
  "completed": false
}
```

#### Resposta

```json
{
  "code": 201,
  "type": "success",
  "status": "success",
  "message": "Atendimento cadastrado com sucesso!",
  "data": {
    "id": 3,
    "id_property": 2,
    "date": "2025-10-10",
    "observation": "Troca de fechadura",
    "completed": 0
  }
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Atendimento cadastrado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao cadastrar o atendimento.|

---

### Listar Atendimentos

**GET**

```http
/appointment/listAll
```

#### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de atendimentos",
  "data": [
    {
      "id_appointment": 1,
      "id_property": 1,
      "date": "2025-06-10",
      "observation": "Lock replacement",
      "completed": 1
    },
    {
      "id_appointment": 2,
      "id_property": 2,
      "date": "2025-06-15",
      "observation": "Bedroom painting",
      "completed": 0
    }
  ]
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de atendimentos retornada com sucesso.|

---

### Buscar Atendimento por ID

**GET**

```http
/appointment/list/{id}
```

#### Exemplo

```http
/appointment/list/1
```

#### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Atendimento encontrado",
  "data": {
    "id": 1,
    "idProperty": 1,
    "date": "2025-06-10",
    "observation": "Lock replacement",
    "completed": 1
  }
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Atendimento encontrado.|
|400|error|bad_request|ID do atendimento é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Atendimento não encontrado.|

---

### Atualizar Atendimento

**PUT**

```http
/appointment/update/{id}
```

#### Corpo da requisição

```json
{
  "id_property": 2,
  "date": "2025-10-10",
  "observation": "Troca de fechadura",
  "completed": true
}
```

#### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Atendimento atualizado com sucesso!",
  "data": {
    "id": 1,
    "id_property": 2,
    "date": "2025-10-10",
    "observation": "Troca de fechadura",
    "completed": 1
  }
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Atendimento atualizado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|404|error|not_found|Atendimento não encontrado.|
|500|error|internal_server_error|Erro ao atualizar o atendimento.|

---

### Excluir Atendimento

**DELETE**

```http
/appointment/delete/{id}
```

#### Exemplo

```http
/appointment/delete/1
```

#### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Atendimento excluido com sucesso"
}
```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Atendimento excluído com sucesso.|
|400|error|bad_request|ID do atendimento é obrigatório e deve ser um número inteiro.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao excluir o atendimento.|
---

# Imóveis

## Inserir

**POST**

```http
/propertie/insert
```

### Corpo da requisição

```json
{
  "location": "Rua das Flores, 100",
  "numberOfRooms": 2,
  "availability": true,
  "latePayment": false
}
```

### Resposta

```json
{
  "code": 201,
  "type": "success",
  "status": "success",
  "message": "Atendimento cadastrado com sucesso!",
  "data": {
    "id": 4,
    "location": "Rua das Flores, 100",
    "numberOfRooms": 2,
    "availability": 1,
    "latePayment": 0
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Imóvel cadastrado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao cadastrar o imóvel.|

---

## Listar

**GET**

```http
/propertie/listAll
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de propriedades",
  "data": [
    {
      "id_property": 1,
      "location": "Rua das Flores, 100",
      "number_of_rooms": 2,
      "availability": 1,
      "late_payment": 0
    },
    {
      "id_property": 2,
      "location": "Av. Brasil, 250",
      "number_of_rooms": 3,
      "availability": 1,
      "late_payment": 0
    },
    {
      "id_property": 3,
      "location": "Rua Independência, 45",
      "number_of_rooms": 1,
      "availability": 0,
      "late_payment": 0
    }
  ]
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de imóveis retornada com sucesso.|

---

## Buscar

**GET**

```http
/propertie/list/{id}
```

### Exemplo

```http
/propertie/list/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Propriedade encontrada com sucesso",
  "data": {
    "id": 1,
    "location": "Rua das Flores, 100",
    "numberOfRooms": 2,
    "availability": 1,
    "latePayment": 0
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Imóvel encontrado com sucesso.|
|400|error|bad_request|ID da propriedade é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Propriedade não encontrada.|

---

## Atualizar

**PUT**

```http
/propertie/update/{id}
```

### Corpo da requisição

```json
{
  "location": "Rua Nova, 250",
  "numberOfRooms": 3,
  "availability": true,
  "latePayment": false
}
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Propriedade atualizada com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Imóvel atualizado com sucesso.|
|400|error|bad_request|ID da propriedade é obrigatório e deve ser um número inteiro.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao atualizar o imóvel.|

---

## Excluir

**DELETE**

```http
/propertie/delete/{id}
```

### Exemplo

```http
/propertie/delete/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "propriedade excluida com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Imóvel excluído com sucesso.|
|400|error|bad_request|ID da propriedade é obrigatório e deve ser um número inteiro.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao excluir o imóvel.|
---

# Pagamentos

## Inserir

**POST**

```http
/payments/register
```

### Corpo da requisição

```json
{
  "idContract": 2,
  "pix": "codigo_pix",
  "receipt": "comprovante.pdf",
  "value": 1200.00,
  "paymentDate": "2025-10-10",
  "status": "PAID"
}
```

### Resposta

```json
{
  "code": 201,
  "type": "success",
  "status": "success",
  "message": "Pagamento cadastrado com sucesso!",
  "data": {
    "id_payment": 3,
    "id_contract": 2,
    "pix": "codigo_pix",
    "receipt": "comprovante.pdf",
    "value": 1200,
    "paymentDate": "2025-10-10",
    "status": "PAID"
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Pagamento cadastrado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao cadastrar o pagamento.|

---

## Listar

**GET**

```http
/payments/listAll
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de propriedades",
  "data": [
    {
      "id_payment": 1,
      "id_contract": 1,
      "pix": "pixjoao@email.com",
      "qr_code": "qrcode_001",
      "receipt": "receipt001.pdf",
      "value": 1200.00,
      "payment_date": "2025-06-05",
      "status": "PAID"
    },
    {
      "id_payment": 2,
      "id_contract": 2,
      "pix": "pixmaria@email.com",
      "qr_code": "qrcode_002",
      "receipt": null,
      "value": 1800.00,
      "payment_date": null,
      "status": "PENDING"
    }
  ]
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de pagamentos retornada com sucesso.|

---

## Buscar

**GET**

```http
/payments/list/{id}
```

### Exemplo

```http
/payments/list/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Atendimento encontrado",
  "data": {
    "id_payment": 1,
    "id_contract": 1,
    "pix": "pixjoao@email.com",
    "receipt": "receipt001.pdf",
    "value": 1200,
    "paymentDate": "2025-06-05",
    "status": "PAID"
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Pagamento encontrado com sucesso.|
|400|error|bad_request|ID do pagamento é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Pagamento não encontrado.|

---

## Atualizar

**PUT**

```http
/payments/update/{id}
```

### Corpo da requisição

```json
{
  "id_contract": 2,
  "pix": "novo_codigo_pix",
  "receipt": "novo_comprovante.pdf",
  "value": 1500.00,
  "payment_date": "2025-11-10",
  "status": "PAID"
}
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Pagamento atualizado com sucesso!",
  "data": {
    "id_payment": 1,
    "id_contract": 2,
    "pix": "novo_codigo_pix",
    "receipt": "novo_comprovante.pdf",
    "value": 1500,
    "paymentDate": "2025-11-10",
    "status": "PAID"
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Pagamento atualizado com sucesso.|
|400|error|bad_request|ID do pagamento inválido ou dados obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao atualizar o pagamento.|

---

## Excluir

**DELETE**

```http
/payments/delete/{id}
```

### Exemplo

```http
/payments/delete/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Pagamento excluido com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Pagamento excluído com sucesso.|
|400|error|bad_request|ID do pagamento é obrigatório e deve ser um número inteiro.|
|500|error|internal_server_error|Erro ao excluir o pagamento.|
---

# Contratos

## Registrar

**POST**

```http
/contract/register
```

### Corpo da requisição

```json
{
  "id_property": 1,
  "rent_value": 1200.00,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "status": "ACTIVE"
}
```

### Resposta

```json
{
  "code": 201,
  "type": "success",
  "status": "success",
  "message": "Contrato cadastrado com sucesso!",
  "data": {
    "id": 3,
    "id_property": 1,
    "id_user": 2,
    "rent_value": 1200,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "status": "ACTIVE"
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Contrato cadastrado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao cadastrar o contrato.|

---

## Listar

**GET**

```http
/contract/listAll
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de contratos",
  "data": [
    {
      "id_contract": 1,
      "id_property": 1,
      "id_user": 1,
      "rent_value": 1200.00,
      "start_date": "2025-01-01",
      "end_date": null,
      "status": "ACTIVE"
    },
    {
      "id_contract": 2,
      "id_property": 3,
      "id_user": 2,
      "rent_value": 1800.00,
      "start_date": "2025-03-01",
      "end_date": null,
      "status": "ACTIVE"
    }
  ]
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de contratos retornada com sucesso.|

---

## Buscar

**GET**

```http
/contract/list/{id}
```

### Exemplo

```http
/contract/list/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Contrato encontrado",
  "data": {
    "id": 1,
    "id_property": 1,
    "id_user": 1,
    "rent_value": 1200,
    "start_date": "2025-01-01",
    "end_date": null,
    "status": "ACTIVE"
  }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Contrato encontrado com sucesso.|
|400|error|bad_request|ID do contrato é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Contrato não encontrado.|

---

## Atualizar

**PUT**

```http
/contract/update/{id}
```

### Corpo da requisição

```json
{
  "id_property": 1,
  "rent_value": 1500.00,
  "start_date": "2025-01-01",
  "end_date": "2026-01-01",
  "status": "ACTIVE"
}
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Contrato atualizado com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Contrato atualizado com sucesso.|
|400|error|bad_request|ID do contrato inválido ou dados obrigatórios ausentes.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao atualizar o contrato.|

---

## Excluir

**DELETE**

```http
/contract/delete/{id}
```

### Exemplo

```http
/contract/delete/1
```

### Resposta

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Contrato excluido com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Contrato excluído com sucesso.|
|400|error|bad_request|ID do contrato é obrigatório e deve ser um número inteiro.|
|500|error|internal_server_error|Erro ao excluir o contrato.|

---

# Messages

## Registrar
**POST**
```
/message/register
```

```json

```

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Mensagem cadastrada com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|500|error|internal_server_error|Erro ao cadastrar a mensagem.|


## Listar
**GET**
```
/message/listAll
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de mensagens retornada com sucesso.|


## Buscar
**GET**
```
/message/list/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Mensagem encontrada com sucesso.|
|400|error|bad_request|ID da mensagem é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Mensagem não encontrada.|


## Atualizar
**PUT**
```
/message/update/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Mensagem atualizada com sucesso.|
|400|error|bad_request|ID da mensagem inválido ou dados obrigatórios ausentes.|
|500|error|internal_server_error|Erro ao atualizar a mensagem.|


## Excluir
**DELETE**
```
/message/delete/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Mensagem excluída com sucesso.|
|400|error|bad_request|ID da mensagem é obrigatório e deve ser um número inteiro.|
|500|error|internal_server_error|Erro ao excluir a mensagem.|

---

# Chats

## Registrar
**POST**
```
/chat/register
```

```json

```

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|Chat cadastrado com sucesso.|
|400|error|bad_request|Dados incorretos ou campos obrigatórios ausentes.|
|500|error|internal_server_error|Erro ao cadastrar o chat.|


## Listar
**GET**
```
/chat/listAll
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de chats retornada com sucesso.|


## Buscar
**GET**
```
/chat/list/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Chat encontrado com sucesso.|
|400|error|bad_request|ID do chat é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Chat não encontrado.|

## Atualizar
**PUT**
```
/chat/update/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Chat atualizada com sucesso.|
|400|error|bad_request|ID do chat inválido ou dados obrigatórios ausentes.|
|500|error|internal_server_error|Erro ao atualizar o chat.|

## Excluir
**DELETE**
```
/chat/delete/{id}
```

```json

```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Chat excluído com sucesso.|
|400|error|bad_request|ID do chat é obrigatório e deve ser um número inteiro.|
|500|error|internal_server_error|Erro ao excluir o chat.|

---