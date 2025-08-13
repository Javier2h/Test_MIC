<?php

require __DIR__ . '/../vendor/autoload.php';
$config = require __DIR__ . '/../src/config.php';
use Slim\Factory\AppFactory;
use App\models\Usuario;

// Conexión PDO
$pdo = new PDO(
    "mysql:host={$config['db']['host']};dbname={$config['db']['dbname']};charset={$config['db']['charset']}",
    $config['db']['user'],
    $config['db']['pass']
);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

AppFactory::setContainer(new DI\Container());
$app = AppFactory::create();

// Registrar rutas
(require __DIR__ . '/../src/routes/auth.php')($app, $pdo, $config);

$app->run();