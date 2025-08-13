<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los mantenimientos (con nombre de la atracción)
    $app->get('/mantenimientos', function (Request $request, Response $response) use ($db) {
        $sql = 'SELECT m.id_mantenimiento, a.nombre as nombre_atraccion, m.fecha, m.descripcion_mant FROM mantenimientos m JOIN atracciones a ON m.id_atracciones = a.id_atracciones';
        $stmt = $db->query($sql);
        $mantenimientos = $stmt->fetchAll();
        $response->getBody()->write(json_encode($mantenimientos));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un mantenimiento por ID
    $app->get('/mantenimientos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM mantenimientos WHERE id_mantenimiento = ?');
        $stmt->execute([$args['id']]);
        $mantenimiento = $stmt->fetch();
        if ($mantenimiento) {
            $response->getBody()->write(json_encode($mantenimiento));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear un nuevo mantenimiento
    $app->post('/mantenimientos', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO mantenimientos (id_atracciones, fecha, descripcion_mant) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['id_atracciones'],
            $data['fecha'],
            $data['descripcion_mant'] ?? null
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_mantenimiento' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar un mantenimiento
    $app->put('/mantenimientos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE mantenimientos SET id_atracciones = ?, fecha = ?, descripcion_mant = ? WHERE id_mantenimiento = ?');
        $stmt->execute([
            $data['id_atracciones'],
            $data['fecha'],
            $data['descripcion_mant'] ?? null,
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar un mantenimiento
    $app->delete('/mantenimientos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM mantenimientos WHERE id_mantenimiento = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });

    // Listar mantenimientos por atracción
    $app->get('/atracciones/{id}/mantenimientos', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM mantenimientos WHERE id_atracciones = ?');
        $stmt->execute([$args['id']]);
        $mantenimientos = $stmt->fetchAll();
        $response->getBody()->write(json_encode($mantenimientos));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
