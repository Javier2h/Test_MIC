<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las terapias
    $app->get('/terapias', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM terapias');
        $terapias = $stmt->fetchAll();
        $response->getBody()->write(json_encode($terapias));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una terapia por ID
    $app->get('/terapias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM terapias WHERE id_terapia = ?');
        $stmt->execute([$args['id']]);
        $terapia = $stmt->fetch();
        if ($terapia) {
            $response->getBody()->write(json_encode($terapia));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva terapias
    $app->post('/terapias', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO terapias (nombre_terapia, descripcion, duracion_minutos, precio) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_terapia'],
            $data['descripcion'],
            $data['duracion_minutos'],
            $data['precio']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_terapia' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una terapia
    $app->put('/terapias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE terapias SET nombre_terapia = ?, descripcion = ?, duracion_minutos = ?, precio = ? WHERE id_terapia = ?');
        $stmt->execute([
            $data['nombre_terapia'],
            $data['descripcion'],
            $data['duracion_minutos'],
            $data['precio'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una terapia
    $app->delete('/terapias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM terapias WHERE id_terapia = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
