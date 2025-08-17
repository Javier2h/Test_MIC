<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las atracciones
    $app->get('/atracciones', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM atracciones');
        $atracciones = $stmt->fetchAll();
        $response->getBody()->write(json_encode($atracciones));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una atracción por ID
    $app->get('/atracciones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM atracciones WHERE id_atracciones = ?');
        $stmt->execute([$args['id']]);
        $atraccion = $stmt->fetch();
        if ($atraccion) {
            $response->getBody()->write(json_encode($atraccion));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva atracción
    $app->post('/atracciones', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO atracciones (nombre, descripcion, estado) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'] ?? null,
            $data['estado'] ?? 'Activo'
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_atracciones' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una atracción
    $app->put('/atracciones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE atracciones SET nombre = ?, descripcion = ?, estado = ? WHERE id_atracciones = ?');
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'] ?? null,
            $data['estado'] ?? 'Activo',
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una atracción
    $app->delete('/atracciones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM atracciones WHERE id_atracciones = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
