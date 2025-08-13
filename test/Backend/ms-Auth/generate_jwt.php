<?php
require __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/src/config.php';
use Firebase\JWT\JWT;

// Datos de ejemplo para el payload
$payload = [
    'id_usuario' => 1,
    'nombre_usuario' => 'admin',
    'rol' => 'admin',
    'exp' => time() + $config['jwt']['expire']
];

$jwt = JWT::encode($payload, $config['jwt']['secret'], 'HS256');

// Mostrar el JWT generado
header('Content-Type: text/plain');
echo $jwt;
