<?php
require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use DI\Container;

$container = new Container();
AppFactory::setContainer($container);

// Registrar dependencias (incluye la conexión a la base de datos)
require __DIR__ . '/../src/dependencies.php';

$app = AppFactory::create();

// Middleware para parsear JSON
$app->addBodyParsingMiddleware();

// Rutas de atracciones
(require __DIR__ . '/../src/routes/atracciones.php')($app);

$app->run();
