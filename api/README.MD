# API - Sistema de Imóveis

## Descrição

Esta API foi desenvolvida em PHP utilizando o framework CoffeeCode Router para gerenciamento das rotas.

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

### Status HTTP

| Código | Descrição |
|---------|-----------|
|201|Usuário inserido com sucesso|
|400|A senha é obrigatória|
|400|bad_request|
|500|internal_server_error|

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

### Status

|Código|Descrição|
|------|---------|
|200|Usuário logado com sucesso|
|400|bad_request|
|401|unauthorized|

---

## Atualizar usuário

**PUT**

```
/users/update
```

---

# Administrador

## Registrar administrador
**POST**
```
/users/register-admin
```

> Ainda não implementado.

---

## Login administrador
**POST**
```
/users/login-admin
```

---

## Atualizar administrador
**PUT**
```
/users/update-admin
```

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

## Cadastrar
**POST**
```
/appointment/register
```

## Corpo da requisição
```json

  {
    "id_property": 2,
    "date": 2025-10-10,
    "observation": "texto",
    "completed": 1
  }

```


## Resposta
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
        "observation": "texto",
        "completed": 1
    }
 }

```



## Listar todos
**GET**
```
/appointment/listAll
```

## Resposta
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
        },
        {
            "id_appointment": 3,
            "id_property": 2,
            "date": "2025-10-10",
            "observation": "texto",
            "completed": 1
        }
    ]
}

```



## Buscar por ID
**GET**
```
/appointment/list/{id}
```

Exemplo

```
GET /appointment/list/5
```

## Atualizar
**PUT**
```
/appointment/update/{id}
```

## Excluir
**DELETE**
```
/appointment/delete/{id}
```

---

# Imóveis

## Inserir
**POST**
```
/propertie/insert
```

## Listar
**GET**
```
/propertie/listAll
```

## Buscar
**GET**
```
/propertie/list/{id}
```

## Atualizar
**PUT**
```
/propertie/update/{id}
```

## Excluir
**DELETE**
```
/propertie/delete/{id}
```

---

# Pagamentos

## Inserir
**POST**
```
/payments/insert
```

## Listar
**GET**
```
/payments/listAll
```

## Buscar
**GET**
```
/payments/list/{id}
```

## Atualizar
**PUT**
```
/payments/update/{id}
```

## Excluir
**DELETE**
```
/payments/delete/{id}
```

---

# Contratos

## Registrar
**POST**
```
/contract/register
```

## Listar
**GET**
```
/contract/listAll
```

## Buscar
**GET**
```
/contract/list/{id}
```

## Atualizar
**PUT**
```
/contract/update/{id}
```

## Excluir
**DELETE**
```
/contract/delete/{id}
```

---

# Mensagens

## Registrar
**POST**
```
/message/register
```

## Listar
**GET**
```
/message/listAll
```

## Buscar
**GET**
```
/message/list/{id}
```

## Atualizar
**PUT**
```
/message/update/{id}
```

## Excluir
**DELETE**
```
/message/delete/{id}
```

---

# Chats

## Registrar
**POST**
```
/chat/register
```

## Listar
**GET**
```
/chat/listAll
```

## Buscar
**GET**
```
/chat/list/{id}
```

## Atualizar
**PUT**
```
/chat/update/{id}
```

## Excluir
**DELETE**
```
/chat/delete/{id}
```

---

# Respostas HTTP

| Código | Significado |
|---------|-------------|
|200|Requisição realizada com sucesso|
|201|Registro criado|
|400|Requisição inválida|
|401|Não autorizado|
|404|URL não encontrada|
|409|Conflito (registro existente)|
|500|Erro interno do servidor|

---

# Exemplo de erro

```json
{
    "code":404,
    "status":"not_found",
    "message":"URL não encontrada"
}
```

---

# Versionamento

O projeto é versionado utilizando Git.

Para clonar o repositório:



---
