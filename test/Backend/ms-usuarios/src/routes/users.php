<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los usuarios
    $app->get('/users', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM usuario');
        $usuarios = $stmt->fetchAll();
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un usuario por ID
    $app->get('/users/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM usuario WHERE id_usuario = ?');
        $stmt->execute([$args['id']]);
        $usuario = $stmt->fetch();
        if ($usuario) {
            $response->getBody()->write(json_encode($usuario));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva usuario
    $app->post('/users', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO usuario (nombre_usuario, contrasena, rol, estado) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_usuario'],
            $data['contrasena'],
            $data['rol'],
            $data['estado']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_usuario' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una usuario
    $app->put('/users/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE usuario SET nombre_usuario = ?, contrasena = ?, rol = ?, estado = ? WHERE id_usuario = ?');
        $stmt->execute([
            $data['nombre_usuario'],
            $data['contrasena'],
            $data['rol'],
            $data['estado'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una usuario
    $app->delete('/users/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM usuario WHERE id_usuario = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
