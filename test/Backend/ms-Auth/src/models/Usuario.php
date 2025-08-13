<?php
namespace App\models;

use PDO;

class Usuario {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function findByNombre($nombre_usuario) {
        $stmt = $this->pdo->prepare('SELECT * FROM usuario WHERE nombre_usuario = ?');
        $stmt->execute([$nombre_usuario]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function create($nombre_usuario, $contrasena, $rol = 'user', $estado = 'activo') {
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('INSERT INTO usuario (nombre_usuario, contrasena, rol, estado) VALUES (?, ?, ?, ?)');
        return $stmt->execute([$nombre_usuario, $hash, $rol, $estado]);
    }
    public function verifyPassword($nombre_usuario, $contrasena) {
        $user = $this->findByNombre($nombre_usuario);
        if ($user && password_verify($contrasena, $user['contrasena'])) {
            return $user;
        }
        return false;
    }
}
