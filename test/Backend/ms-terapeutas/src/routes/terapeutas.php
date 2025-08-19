<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los terapeutas
    $app->get('/terapeutas', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM terapeutas');
        $terapeutas = $stmt->fetchAll();
        $response->getBody()->write(json_encode($terapeutas));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un terapeuta por ID
    $app->get('/terapeutas/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM terapeutas WHERE id_terapeuta = ?');
        $stmt->execute([$args['id']]);
        $terapeuta = $stmt->fetch();
        if ($terapeuta) {
            $response->getBody()->write(json_encode($terapeuta));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear un nuevo terapeuta
    $app->post('/terapeutas', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO terapeutas (nombre_completo, especialidad, telefono, correo) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_completo'],
            $data['especialidad'],
            $data['telefono'],
            $data['correo']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_terapeuta' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });
    

    // Actualizar un terapeuta
    $app->put('/terapeutas/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE terapeutas SET nombre_completo = ?, especialidad = ?, telefono = ?, correo = ? WHERE id_terapeuta = ?');
        $stmt->execute([
            $data['nombre_completo'],
            $data['especialidad'],
            $data['telefono'],
            $data['correo'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    
    // Eliminar un terapeuta
    $app->delete('/terapeutas/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM terapeutas WHERE id_terapeuta = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
