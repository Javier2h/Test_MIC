<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todas las categorias
    $app->get('/categorias', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM categorias');
        $categorias = $stmt->fetchAll();
        $response->getBody()->write(json_encode($categorias));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener una categoria por ID
    $app->get('/categorias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM categorias WHERE id_categoria = ?');
        $stmt->execute([$args['id']]);
        $categoria = $stmt->fetch();
        if ($categoria) {
            $response->getBody()->write(json_encode($categoria));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear una nueva categoria
    $app->post('/categorias', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO categorias (nombre_categoria) VALUES (?)');
        $stmt->execute([
            $data['nombre_categoria']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_categoria' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar una categoria
    $app->put('/categorias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE categorias SET nombre_categoria = ? WHERE id_categoria = ?');
        $stmt->execute([
            $data['nombre_categoria'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar una categoria
    $app->delete('/categorias/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM categorias WHERE id_categoria = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
