<?php
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set("America/Sao_Paulo");

ob_start();

require __DIR__ . "/vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true"); // Permitir credenciais

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;
// localhost/acme-3am/api
$route = new Router(url("api"), ":");

// User
$route->namespace("Source\Controller");
$route->group("/users");
$route->post("/register", "Users:register"); // Registrar usuário comum
$route->post("/login", "Users:auth"); // login de usuário comum
$route->post("/login-admin", "Users:authAdmin"); // login de usuário admin
$route->put("/update-admin", "Users:updateAdmin"); // update de usuário comum
$route->put("/update", "Users:update"); // update de usuário comum
$route->post("/register-admin", "Users:registerAdmin"); // Registrar usuário admin NÃO IMPLEMENTADO
$route->post("/login-admin", "Users:authAdmin"); // login de usuário admin
$route->put("/update-admin", "Users:updateAdmin"); // update de usuário admin
$route->group(null);

// FAQs
$route->namespace("Source\Controller\Faqs");
$route->group("/faqs");

$route->get("/list", "Faqs:listAll");
$route->get("/list/{id}", "Faqs:listById");
$route->post("/insert", "Faqs:insert");
$route->put("/update/{id}", "Faqs:update");
$route->delete("/delete/{id}", "Faqs:delete");

$route->group(null);

$route->group("/faqs-categories");

$route->get("/listAll", "FaqsCategories:listAll");
$route->get("/list/{id}", "FaqsCategories:listById");
$route->post("/insert", "FaqsCategories:insert");

$route->group(null);
//Appointment
$route->namespace("Source\Controller");
$route->group("/appointments");
$route->post("/insert", "Appointments:register"); //funcionando
$route->get("/listAll", "Appointments:listAll"); //funcionando
$route->get("/list/{id}", "Appointments:listById"); //funcionando
$route->put("/update/{id}", "Appointments:update");
$route->delete("/delete/{id}", "Appointments:delete"); //funcionando
$route->group(null);

//Properties
$route->namespace("Source\Controller");
$route->group("/properties");
$route->post("/insert", "Properties:insert"); //funcionando
$route->get("/listAll", "Properties:listAll"); //funcionando
$route->get("/list/{id}", "Properties:listById"); //funcionando
$route->put("/update/{id}", "Properties:update"); //funcionando
$route->delete("/delete/{id}", "Properties:delete"); //funcionando
$route->group(null);

//Payments
$route->namespace("Source\Controller");
$route->group("/payments");
$route->post("/insert", "Payments:register"); //funcionando
$route->get("/listAll", "Payments:listAll"); //funcionando
$route->get("/list/{id}", "Payments:listById"); //funcionando
$route->put("/update/{id}", "Payments:update"); //funcionando
$route->delete("/delete/{id}", "Payments:delete"); //funcionando
$route->group(null);

//Contracts
$route->namespace("Source\Controller");
$route->group("/contracts");
$route->post("/insert", "Contracts:register"); //funcionando
$route->get("/listAll", "Contracts:listAll"); //funcionando
$route->get("/list/{id}", "Contracts:listById"); //funcionando
$route->put("/update/{id}", "Contracts:update"); //fucionando
$route->delete("/delete/{id}", "Contracts:delete"); //funcionando
$route->group(null);

//Messages
$route->namespace("Source\Controller");
$route->group("/messages");
$route->post("/insert", "Messages:register"); //funcionando
$route->get("/listAll", "Messages:listAll"); //funcionando
$route->get("/list/{id}", "Messages:listById"); //funcionando
$route->put("/update/{id}", "Messages:update"); 
$route->delete("/delete/{id}", "Messages:delete"); //funcionando
$route->group(null);

//Chats
$route->namespace("Source\Controller");
$route->group("/chats");
$route->post("/insert", "Chats:register"); //funcionando
$route->get("/listAll", "Chats:listAll"); //funcionando
$route->get("/list/{id}", "Chats:listById"); //funcionando
$route->put("/update/{id}", "Chats:update");
$route->delete("/delete/{id}", "Chats:delete"); //funcionando
$route->group(null);

$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header("Content-Type: application/json; charset=UTF-8");
    //http_response_code(404);

    echo json_encode(
        [
            "code" => 404,
            "status" => "not_found",
            "message" => "URL não encontrada",
        ],
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE,
    );
}

ob_end_flush();
