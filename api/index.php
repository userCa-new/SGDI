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

$route->namespace("Source\Controller");

$route->group("/users");
$route->post("/register", "Users:register"); // Registrar usuário comum
$route->post("/login", "Users:auth"); // login de usuário comum
$route->put("/update", "Users:update"); // update de usuário comum
$route->post("/register-admin", "Users:registerAdmin"); // Registrar usuário admin NÃO IMPLEMENTADO
$route->post("/login-admin", "Users:authAdmin"); // login de usuário admin
$route->put("/update-admin", "Users:updateAdmin"); // update de usuário admin
$route->group(null);

// FAQs
$route->namespace("Source\Controller\Faqs");
$route->group("/faqs");
$route->get("/list", "Faqs:listAll");
$route->post("/", "Faqs:insert");
$route->group(null);

// Categorias de FAQs
$route->group("/faqs-categories");
$route->group(null);
// Fim - Exercícios - Desafios

$route->namespace("Source\Controller");

//Appointment
$route->group("/appointment");
$route->post("/register", "Appointments:register");
$route->get("/list/{id}", "Appointments:listById");
$route->put("/update/{id}", "Appointments:update");
$route->delete("/delete/{id}", "Appointments:delete");
$route->group(null);

//Properties
$route->namespace("Source\Controller");
$route->group("/propertie");
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
$route->put("/update/{id}", "Payments:update");
$route->delete("/delete/{id}", "Payments:delete");
$route->group(null);

//Contracts
$route->namespace("Source\Controller");
$route->group("/contract");
$route->post("/register", "Contracts:register");
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
