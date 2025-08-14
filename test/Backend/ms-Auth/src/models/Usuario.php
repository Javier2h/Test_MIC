<?php
namespace App\models;

use PDO;

class Usuario {
    private $pdo;
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    public function findByNombre($nombre_usuario) {
        $stmt = $this->pdo->prepare('SELECT * FROM usuarios WHERE nombre_usuario = ?');
        $stmt->execute([$nombre_usuario]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function create($nombre_usuario, $contrasena, $rol = 'user') {
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare('INSERT INTO usuarios (nombre_usuario, contrasena, rol) VALUES (?, ?, ?)');
        return $stmt->execute([$nombre_usuario, $hash, $rol]);
    }
    public function verifyPassword($nombre_usuario, $contrasena) {
        $user = $this->findByNombre($nombre_usuario);
        if ($user && password_verify($contrasena, $user['contrasena'])) {
            return $user;
        }
        return false;
    }
}
