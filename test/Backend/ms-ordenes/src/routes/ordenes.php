<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las órdenes
    $app->get('/ordenes', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM ordenes');
        $ordenes = $stmt->fetchAll();
        $response->getBody()->write(json_encode($ordenes));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una orden por ID
    $app->get('/ordenes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM ordenes WHERE id_orden = ?');
        $stmt->execute([$args['id']]);
        $orden = $stmt->fetch();
        if ($orden) {
            $response->getBody()->write(json_encode($orden));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva orden
    $app->post('/ordenes', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO ordenes (id_cliente, fecha_orden, total) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['id_cliente'],
            $data['fecha_orden'],
            $data['total']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_orden' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una orden
    $app->put('/ordenes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE ordenes SET id_cliente = ?, fecha_orden = ?, total = ? WHERE id_orden = ?');
        $stmt->execute([
            $data['id_cliente'],
            $data['fecha_orden'],
            $data['total'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una orden
    $app->delete('/ordenes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM ordenes WHERE id_orden = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
