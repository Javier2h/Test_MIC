<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las empleados
    $app->get('/empleados', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM empleados');
        $empleados = $stmt->fetchAll();
        $response->getBody()->write(json_encode($empleados));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una empleado por ID
    $app->get('/empleados/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM empleados WHERE id_empleado = ?');
        $stmt->execute([$args['id']]);
        $empleado = $stmt->fetch();
        if ($empleado) {
            $response->getBody()->write(json_encode($empleado));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva empleado
    $app->post('/empleados', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO empleados (nombre, direccion, correo, telefono) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre'],
            $data['direccion'] ?? null,
            $data['correo'] ?? null,
            $data['telefono'] ?? null
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_empleado' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una empleado
    $app->put('/empleados/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE empleados SET nombre = ?, direccion = ?, correo = ?, telefono = ? WHERE id_empleado = ?');
        $stmt->execute([
            $data['nombre'],
            $data['direccion'] ?? null,
            $data['correo'] ?? null,
            $data['telefono'] ?? null,
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una empleado
    $app->delete('/empleados/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM empleados WHERE id_empleado = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
