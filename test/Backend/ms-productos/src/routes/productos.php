<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    $container = $app->getContainer();
    $db = $container->get('db');

    // Listar todos los productos
    $app->get('/productos', function (Request $request, Response $response) use ($db) {
        $stmt = $db->query('SELECT * FROM productos');
        $productos = $stmt->fetchAll();
        $response->getBody()->write(json_encode($productos));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener un producto por ID
    $app->get('/productos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('SELECT * FROM productos WHERE id_producto = ?');
        $stmt->execute([$args['id']]);
        $producto = $stmt->fetch();
        if ($producto) {
            $response->getBody()->write(json_encode($producto));
            return $response->withHeader('Content-Type', 'application/json');
        }
        return $response->withStatus(404);
    });

    // Crear un nuevo producto
    $app->post('/productos', function (Request $request, Response $response) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('INSERT INTO productos (nombre_producto, descripcion, precio, stock, id_categoria) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['nombre_producto'],
            $data['descripcion'],
            $data['precio'],
            $data['stock'],
            $data['id_categoria']
        ]);
        $id = $db->lastInsertId();
        $response->getBody()->write(json_encode(['id_producto' => $id]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    });

    // Actualizar un producto
    $app->put('/productos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $data = $request->getParsedBody();
        $stmt = $db->prepare('UPDATE productos SET nombre_producto = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ? WHERE id_producto = ?');
        $stmt->execute([
            $data['nombre_producto'],
            $data['descripcion'],
            $data['precio'],
            $data['stock'],
            $data['id_categoria'],
            $args['id']
        ]);
        return $response->withStatus(204);
    });

    // Eliminar un producto
    $app->delete('/productos/{id}', function (Request $request, Response $response, $args) use ($db) {
        $stmt = $db->prepare('DELETE FROM productos WHERE id_producto = ?');
        $stmt->execute([$args['id']]);
        return $response->withStatus(204);
    });
};
