<?php
// Configuración de la base de datos MariaDB
return [
    'db' => [
        'host' => 'localhost',
        'user' => 'root', // Cambia si tienes otro usuario
        'pass' => '',     // Cambia si tienes contraseña
        'dbname' => 'panaderia2', // Cambia por el nombre de tu base de datos
        'charset' => 'utf8mb4'
    ],
    'jwt' => [
        'secret' => 'php generate_jwt.php', // Cambia por un secreto seguro
        'expire' => 3600 // 1 hora
    ]
];
