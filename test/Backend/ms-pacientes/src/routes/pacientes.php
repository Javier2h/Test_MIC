<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los pacientes
    $app->get('/pacientes', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM Pacientes');
        $pacientes = $stmt->fetchAll();
        $response->getBody()->write(json_encode($pacientes));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un paciente por ID
    $app->get('/pacientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM Pacientes WHERE id_paciente = ?');
        $stmt->execute([$args['id']]);
        $paciente = $stmt->fetch();
        if ($paciente) {
            $response->getBody()->write(json_encode($paciente));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear un nuevo paciente
    $app->post('/pacientes', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO Pacientes (nombre_completo, fecha_nacimiento, genero, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_completo'],
            $data['fecha_nacimiento'],
            $data['genero'],
            $data['telefono'],
            $data['correo'],
            $data['direccion']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_paciente' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar un paciente
    $app->put('/pacientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE Pacientes SET nombre_completo = ?, fecha_nacimiento = ?, genero = ?, telefono = ?, correo = ?, direccion = ? WHERE id_paciente = ?');
        $stmt->execute([
            $data['nombre_completo'],
            $data['fecha_nacimiento'],
            $data['genero'],
            $data['telefono'],
            $data['correo'],
            $data['direccion'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar un paciente
    $app->delete('/pacientes/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM Pacientes WHERE id_paciente = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
