<?php
use Slim\App;
use Slim\Psr7\Response;
use App\models\Usuario;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

return function (App $app, $pdo, $config) {
    // Obtener todos los usuarios
    $app->get('/usuarios', function ($request, $response) use ($pdo) {
        $stmt = $pdo->query('SELECT id_usuario, nombre_usuario, rol, estado FROM usuario');
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    });
    $app->post('/register', function ($request, $response) use ($pdo) {
        $data = $request->getParsedBody();
        if ($data === null) {
            $data = json_decode($request->getBody()->getContents(), true);
        }
        if (!isset($data['nombre_usuario']) || empty($data['nombre_usuario'])) {
            $response->getBody()->write(json_encode(['error' => 'El nombre de usuario es obligatorio']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        $usuario = new Usuario($pdo);
        if ($usuario->findByNombre($data['nombre_usuario'])) {
            $response->getBody()->write(json_encode(['error' => 'Usuario ya existe']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }
        $usuario->create($data['nombre_usuario'], $data['contrasena'], $data['rol'] ?? 'user', $data['estado'] ?? 'activo');
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    $app->post('/login', function ($request, $response) use ($pdo, $config) {
        $data = $request->getParsedBody();
        if ($data === null) {
            $data = json_decode($request->getBody()->getContents(), true);
        }
        $usuario = new Usuario($pdo);
        $user = $usuario->verifyPassword($data['nombre_usuario'], $data['contrasena']);
        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'Credenciales inválidas']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        if ($user['estado'] !== 'activo') {
            $response->getBody()->write(json_encode(['error' => 'Usuario inactivo']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $payload = [
            'id_usuario' => $user['id_usuario'],
            'nombre_usuario' => $user['nombre_usuario'],
            'rol' => $user['rol'],
            'exp' => time() + $config['jwt']['expire']
        ];
        $jwt = JWT::encode($payload, $config['jwt']['secret'], 'HS256');
        $response->getBody()->write(json_encode([
            'token' => $jwt,
            'nombre_usuario' => $user['nombre_usuario'],
            'rol' => $user['rol']
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    $app->get('/validate', function ($request, $response) use ($config) {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $response->getBody()->write(json_encode(['error' => 'Token no proporcionado']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        $jwt = $matches[1];
        try {
            $decoded = JWT::decode($jwt, new Key($config['jwt']['secret'], 'HS256'));
            $response->getBody()->write(json_encode(['valid' => true, 'data' => $decoded]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Token inválido']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    });
};
