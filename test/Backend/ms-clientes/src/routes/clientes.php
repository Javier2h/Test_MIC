<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los clientes
    $app->get('/clientes', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM clientes');
        $clientes = $stmt->fetchAll();
        $response->getBody()->write(json_encode($clientes));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un cliente por ID
    $app->get('/clientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM clientes WHERE id_cliente = ?');
        $stmt->execute([$args['id']]);
        $cliente = $stmt->fetch();
        if ($cliente) {
            $response->getBody()->write(json_encode($cliente));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear un nuevo cliente
    $app->post('/clientes', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO clientes (nombre_cliente, correo, telefono, direccion) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_cliente'],
            $data['correo'],
            $data['telefono'],
            $data['direccion']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_cliente' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar un cliente
    $app->put('/clientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE clientes SET nombre_cliente = ?, correo = ?, telefono = ?, direccion = ? WHERE id_cliente = ?');
        $stmt->execute([
            $data['nombre_cliente'],
            $data['correo'],
            $data['telefono'],
            $data['direccion'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar un cliente
    $app->delete('/clientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM clientes WHERE id_cliente = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
