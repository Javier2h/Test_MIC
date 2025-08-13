<?php
// API Gateway básico para microservicios

// Configuración de microservicios
$services = [
	'atracciones' => [
		'url' => 'http://localhost:8001', // Cambia el puerto/url según tu microservicio
	],
	'auth' => [
        'url' => 'http://localhost:8002', // ms-Auth en el puerto 8002
    ],
	// Puedes agregar más microservicios aquí
];

// Obtener la ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Extraer el primer segmento de la ruta para identificar el microservicio
$path = trim(parse_url($requestUri, PHP_URL_PATH), '/');
$segments = explode('/', $path);
$serviceKey = $segments[0] ?? '';


if (isset($services[$serviceKey])) {
	// Construir la URL destino (eliminar el prefijo del microservicio)
	$serviceUrl = rtrim($services[$serviceKey]['url'], '/');
	$subPath = implode('/', array_slice($segments, 1));
	if ($subPath) {
		$serviceUrl .= '/' . $serviceKey . '/' . $subPath;
	} else {
		$serviceUrl .= '/' . $serviceKey;
	}
	$queryString = $_SERVER['QUERY_STRING'] ?? '';
	if ($queryString) {
		$serviceUrl .= '?' . $queryString;
	}

	// Preparar la petición cURL
	$ch = curl_init($serviceUrl);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	// Pasar los headers
	$headers = [];
	foreach (getallheaders() as $key => $value) {
		$headers[] = "$key: $value";
	}
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	// Pasar el body si corresponde
	$input = file_get_contents('php://input');
	if ($input && in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
		curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
	}

	// Ejecutar la petición
	$response = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	curl_close($ch);

	// Devolver la respuesta del microservicio
	if ($contentType) {
		header('Content-Type: ' . $contentType);
	}
	http_response_code($httpCode);
	echo $response;
	exit;
} else {
	// Microservicio no encontrado
	http_response_code(404);
	header('Content-Type: application/json');
	echo json_encode([
		'error' => 'Microservicio no encontrado',
		'servicios_disponibles' => array_keys($services)
	]);
	exit;
}