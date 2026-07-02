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

## Token
```
(1: Inquilino, 2: Propriétario, 3: Administrador)
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
    "name":"user",
    "email":"user@email.com",
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
    "name": "user",
    "email": "user@gmail.com"
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
    "email":"user@email.com",
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
    "name": "user",
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

### Corpo da requisição

```json
{
    "name": "user12", 
    "email":"user12@email.com",
    "password":"123"
}
```

### Resposta
```json
{

}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário atualizado com sucesso.|
|401|error|unathorized|Usuário não está autenticado (sem token ou token inválido).|

---

# Administrador

### Registrar administrador
**POST**
```
/users/register-admin
```
### Corpo da requisição

```json
{
    
    
    "email":"user@email.com",
    "password":"123"
}
```


### Resposta
```json
{
  
}
```



---

### Login administrador
**POST**
```
/users/login-admin
```

### Corpo da requisição

```json
{
    "email":"user12@email.com",
    "password":"123"
}
```


### Resposta
```json
{
  
}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário logado com sucesso.|
|400|error|bad_request|E-mail e senha são obrigatórios. O e-mail deve ser válido.|
|401|error|unathorized|A senha é obrigatória.|

---

### Atualizar administrador
**PUT**
```
/users/update-admin
```

### Corpo da requisição

```json
{
    "email":"user@email.com",
    "password":"123"
}
```


### Resposta
```json
{
  
}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Usuário atualizado com sucesso.|
|401|error|unathorized|Usuário não está autenticado (sem token ou token inválido).|


---

# FAQs

### Inserir FAQ
**POST**
```
/faqs/insert
```

#### Corpo da requisição
```json
{
  "faqs_category_id": "1",
  "question": "Pergunta",
  "answer": "Resposta"
}
```

#### Resposta
```json

{
    "code": 201,
    "type": "success",
    "status": "success",
    "message": "FAQ cadastrada com sucesso",
    "data": {
        "id_faq": 6,
        "id_category": 1,
        "question": "Pergunta",
        "answer": "Resposta",
        "active": 1
    }
}


```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|201|success|success|FAQ inserido com sucesso.|
|400|error|bad_request|Os campos question, answer e faqs_category_id são obrigatórios.|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao cadastrar o FAQ.|

### Listar FAQs
**GET**
```
/faqs/listAll
```

#### Resposta

```json

    {
        "faqs_category_id":1,
        "question":"Pergunta",
        "answer":"Resposta"
    }

```



#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de Faqs.|

### Buscar FAQ por ID
**GET**
```
/faqs/list/{id}
```

#### Exemplo
```
/faqs/list/1
```

#### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "FAQ encontrada",
    "data": {
        "id_faq": 1,
        "id_category": 2,
        "question": "question?",
        "answer": "answer",
        "active": 1
    }
}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|FAQ encontrada.|
|400|error|bad_request|ID da FAQ é obrigatório e deve ser um número inteiro.|
|404|error|not_found|FAQ não encontrada.|

### Atualizar FAQ
**PUT**
```
/faqs/update/{id}
```

#### Exemplo
```
/faqs/update/1
```
#### Corpo da requisição
```json
{
  "faqs_category_id": "2",
  "question": "question?",
  "answer": "answer"
}
```
#### Resposta
```json

{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "FAQ atualizada com sucesso",
    "data": {
        "id_faq": "1",
        "id_category": 2,
        "question": "question?",
        "answer": "answer"
    }
}

```

#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|FAQ atualizado com sucesso.|
|400|error|bad_request|ID do FAQ é obrigatório e deve ser um número inteiro.|
|400|error|bad_request|ID inválido ou campos obrigatórios ausentes|
|401|error|unauthorized|Token de autenticação inválido ou expirado.|
|500|error|internal_server_error|Erro ao atualizar a faq.|

---

# Categorias de FAQs
### Inserir Categoria de FAQ
**POST**
```
/faqs-categories/insert
```

#### Corpo da requisição
```json
{
  "name": "Frequente"
}
```

#### Resposta
```json

{
    "code": 201,
    "type": "success",
    "status": "success",
    "message": "Categoria criada com sucesso",
    "data": {
        "id_category": 5,
        "name": "frequente"
    }
}


```
### Listar categorias das FAQs
**GET**
```
/faqs-categories/listAll
```

#### Resposta

```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Lista de categorias",
    "data": [
        {
            "id_category": 1,
            "name": "Payments",
            "active": 1
        },
        {
            "id_category": 2,
            "name": "Contracts",
            "active": 1
        },
        {
            "id_category": 3,
            "name": "Properties",
            "active": 1
        },
        {
            "id_category": 4,
            "name": "frequente",
            "active": 1
        },
        {
            "id_category": 5,
            "name": "frequente",
            "active": 1
        }
    ]
}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Lista de categorias de Faq.|

### Buscar categoria da FAQ por ID
**GET**
```
/faqs-categories/list/{id}
```

#### Exemplo
```
/faqs/list/1
```

#### Resposta
```json
{
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Categoria encontrada",
    "data": {
        "id_category": 1,
        "name": "Payments",
        "active": 1
    }
}
}
```


#### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Categoria encontrada.|
|400|error|bad_request|ID da categoria é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Categoria não encontrada.|

---

# Atendimentos

### Cadastrar Atendimento

**POST**

```
/appointment/register
```

#### Corpo da requisição

```json
{
  "id_property": 2,
  "date": "2025-10-10",
  "observation": "Troca de fechadura",
  "completed": 0
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

```
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

```
/appointment/list/{id}
```

#### Exemplo

```
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

```
/appointment/update/{id}
```


### Exemplo

```
/appointment/update/1
```

#### Corpo da requisição

```json
{
  "id_property": 2,
  "date": "2025-10-10",
  "observation": "Troca de fechadura",
  "completed": 1
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

```
/appointment/delete/{id}
```

#### Exemplo

```
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

```
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

```
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

```
/propertie/list/{id}
```

### Exemplo

```
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

```
/propertie/update/{id}
```

### Exemplo

```
/propertie/update/1
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

```
/propertie/delete/{id}
```

### Exemplo

```
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

```
/payments/register
```

### Corpo da requisição

```json
{
  "idContract": 2,
  "pix": "codigo_pix",
  "qr_code": "codigo_qr",
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
    "qr_code": "codigo_qr",
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

```
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

```
/payments/list/{id}
```

### Exemplo

```
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

```
/payments/update/{id}
```

### Exemplo

```
/payments/update/1
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

```
/payments/delete/{id}
```

### Exemplo

```
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

```
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

```
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

```
/contract/list/{id}
```

### Exemplo

```
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

```
/contract/update/{id}
```


### Exemplo

```
/contract/update/1
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

```
/contract/delete/{id}
```

### Exemplo

```
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

### Corpo da requisição
```json
  {
    "id_chat": 2,
    "id_sender": 1,
    "message": "mensagem",
    "date_time": "2025-05-27 14:00:00"
  }
```

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "mensagem cadastrada com sucesso!",
    "data": {
        "id_message": 6,
        "id_chat": 2,
        "id_sender": 1,
        "message": "mensagem",
        "date_time": "2025-05-27 14:00:00"
    }
}
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

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Lista de messagens",
    "data": [
        {
            "id_message": 3,
            "id_chat": 2,
            "id_sender": 2,
            "message": "Gostaria de agendar uma visita.",
            "date_time": "2025-05-27 14:00:00"
        },
        {
            "id_message": 4,
            "id_chat": 2,
            "id_sender": 4,
            "message": "Claro, podemos marcar para amanhã.",
            "date_time": "2025-05-27 14:20:00"
        },
        {
            "id_message": 5,
            "id_chat": 2,
            "id_sender": 1,
            "message": "ALA",
            "date_time": "2025-05-27 14:00:00"
        },
        {
            "id_message": 6,
            "id_chat": 2,
            "id_sender": 1,
            "message": "mensagem",
            "date_time": "2025-05-27 14:00:00"
        }
    ]
}
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

### Exemplo

```
/message/list/3
```

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Mensagem encontrada com sucesso",
    "data": {
        "id_message": 3,
        "id_chat": 2,
        "id_sender": 2,
        "message": "Gostaria de agendar uma visita.",
        "date_time": "2025-05-27 14:00:00"
    }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Mensagem encontrada com sucesso.|
|400|error|bad_request|ID da mensagem é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Mensagem não encontrada.|


## Excluir
**DELETE**
```
/message/delete/{id}
```

### Exemplo

```
/message/delete/3
```


### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Messagem excluida com sucesso"
}
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
 
 ### Corpo da requisição
```json
{
  "id_property": 2,
  "creation_date": "2026-10-10 12:00:00"
}
```

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Chat registrado com sucesso",
    "data": {
        "id_chat": 4,
        "id_property": 2,
        "creationDate": "2026-10-10 12:00:00"
    }
}
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

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Lista de chats",
    "data": [
        {
            "id_chat": 2,
            "id_property": 3,
            "creation_date": "2025-05-25 11:00:00"
        },
        {
            "id_chat": 3,
            "id_property": 1,
            "creation_date": "2025-05-25 11:00:00"
        },
        {
            "id_chat": 4,
            "id_property": 2,
            "creation_date": "2026-10-10 12:00:00"
        }
    ]
}
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

### Exemplo

```
/chat/list/2
```

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Chat encontrado com sucesso",
    "data": {
        "id_chat": 2,
        "id_property": 3,
        "creation_date": "2025-05-25 11:00:00"
    }
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Chat encontrado com sucesso.|
|400|error|bad_request|ID do chat é obrigatório e deve ser um número inteiro.|
|404|error|not_found|Chat não encontrado.|


## Excluir
**DELETE**
```
/chat/delete/{id}
```


### Exemplo

```
/chat/delete/2
```

### Resposta
```json
{
    "code": 200,
    "type": "success",
    "status": "success",
    "message": "Chat excluido com sucesso"
}
```

### Status HTTP

| Código | type | status | Significado |
|--------|------|--------|-------------|
|200|success|success|Chat excluído com sucesso.|
|400|error|bad_request|ID do chat é obrigatório e deve ser um número inteiro.|
|500|error|internal_server_error|Erro ao excluir o chat.|
---
