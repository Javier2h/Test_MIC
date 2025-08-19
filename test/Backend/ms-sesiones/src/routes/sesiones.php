<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las sesiones
    $app->get('/sesiones', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT s.id_sesion, s.fecha, s.hora, s.notas, 
            p.nombre_completo as paciente, t.nombre_completo as terapeuta, te.nombre_terapia as terapia
            FROM Sesiones s
            JOIN Pacientes p ON s.id_paciente = p.id_paciente
            JOIN Terapeutas t ON s.id_terapeuta = t.id_terapeuta
            JOIN Terapias te ON s.id_terapia = te.id_terapia');
        $sesiones = $stmt->fetchAll();
        $response->getBody()->write(json_encode($sesiones));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una sesión por ID
    $app->get('/sesiones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM Sesiones WHERE id_sesion = ?');
        $stmt->execute([$args['id']]);
        $sesion = $stmt->fetch();
        if ($sesion) {
            $response->getBody()->write(json_encode($sesion));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva sesión
    $app->post('/sesiones', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO Sesiones (id_paciente, id_terapeuta, id_terapia, fecha, hora, notas) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['id_paciente'],
            $data['id_terapeuta'],
            $data['id_terapia'],
            $data['fecha'],
            $data['hora'],
            $data['notas'] ?? null
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_sesion' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una sesión
    $app->put('/sesiones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE Sesiones SET id_paciente = ?, id_terapeuta = ?, id_terapia = ?, fecha = ?, hora = ?, notas = ? WHERE id_sesion = ?');
        $stmt->execute([
            $data['id_paciente'],
            $data['id_terapeuta'],
            $data['id_terapia'],
            $data['fecha'],
            $data['hora'],
            $data['notas'] ?? null,
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una sesión
    $app->delete('/sesiones/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM Sesiones WHERE id_sesion = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
