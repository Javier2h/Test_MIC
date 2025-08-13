<?php
use DI\Container;

$config = require __DIR__ . '/config.php';

// $container debe estar definido en el ámbito global (lo crea index.php)
global $container;
$container->set('db', function() use ($config) {
    $db = $config['db'];
    $dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}";
    return new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
});
