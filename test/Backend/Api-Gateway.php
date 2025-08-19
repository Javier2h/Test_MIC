<?php
require_once __DIR__ . '/ms-Auth/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
// ...existing code...
// CORS headers (siempre incluir en la respuesta)
if (isset($_SERVER['HTTP_ORIGIN'])) {
	header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 86400'); // 1 día
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
	}
	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
		header('Access-Control-Allow-Headers: ' . $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']);
	}
	exit(0);
}
// API Gateway básico para microservicios

// Configuración de microservicios
$services = [
	'terapeutas' => [
		'url' => 'http://192.168.100.177:8001', // Cambia el puerto/url según tu microservicio
	],
	'auth' => [
        'url' => 'http://192.168.100.177:8002', // ms-Auth en el puerto 8002
    ],
	'pacientes' => [
		'url' => 'http://192.168.100.177:8003', // ms-Pacientes en el puerto 8003
	],
	'terapias' => [
		'url' => 'http://192.168.100.177:8004', // ms-Sesiones en el puerto 8004
	],
	'users' => [
		'url' => 'http://192.168.100.177:8005', // ms-Usuarios en el puerto 8005
	],
	'sesiones' => [
		'url' => 'http://192.168.100.177:8006', // ms-Sesiones en el puerto 8006
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
	
    // Detectar si la ruta es /auth/login para no requerir token
    if ($serviceKey === 'auth' && isset($segments[1]) && $segments[1] === 'login' && $requestMethod === 'POST') {
        // No requiere token, omitir validación
    } else {
        // --- INICIO: Validación de rol y permisos ---
        // Obtener el JWT del header Authorization
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $jwt = '';
        if (preg_match('/Bearer\s+(.*)/i', $authHeader, $matches)) {
            $jwt = $matches[1];
        }
        $userRole = null;
		if ($jwt) {
			// Decodificar JWT para obtener el rol
			$config = require __DIR__ . '/ms-Auth/src/config.php';
			try {
				$decoded = JWT::decode($jwt, new Key($config['jwt']['secret'], 'HS256'));
				$userRole = $decoded->rol ?? null;
			} catch (Exception $e) {
				http_response_code(401);
				echo json_encode(['error' => 'Token inválido o expirado']);
				exit;
			}
		} else {
			http_response_code(401);
			echo json_encode(['error' => 'No se envió el token de autenticación']);
			exit;
		}

        // Validar permisos según el rol
		// Validación de permisos por rol
		$allowedMethods = [];
		if ($userRole === 'supervisor' || $userRole === 'Supervisor') {
			$allowedMethods = ['GET'];
		} else if ($userRole === 'desarrollador' || $userRole === 'Desarrollador') {
			$allowedMethods = ['GET', 'POST', 'PUT', 'PATCH'];
		} else if ($userRole === 'admin' || $userRole === 'Administrador') {
			$allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
		} else {
			http_response_code(403);
			echo json_encode(['error' => 'Rol no autorizado']);
			exit;
		}
		if (!in_array($requestMethod, $allowedMethods)) {
			http_response_code(403);
			echo json_encode(['error' => 'Permiso denegado para el rol']);
			exit;
		}
        // --- FIN: Validación de rol y permisos ---
    }

	// Log para comprobar que la petición pasa por el API Gateway
	file_put_contents(__DIR__ . '/gateway.log', date('Y-m-d H:i:s') . " - Acceso a microservicio '$serviceKey' ruta: $requestUri\n", FILE_APPEND);
	$serviceUrl = rtrim($services[$serviceKey]['url'], '/');
	$subPath = implode('/', array_slice($segments, 1));
	if ($serviceKey === 'auth') {
		$serviceUrl .= $subPath ? '/' . $subPath : '';
	} else if ($serviceKey === 'terapeutas') {
		// Siempre reenviamos la ruta completa a ms-terapeutas
		$forwardPath = $path; // $path ya incluye /terapeutas y cualquier subruta
		$serviceUrl .= '/' . $forwardPath;
	} else if ($serviceKey === 'pacientes') {
		// Siempre reenviamos la ruta completa a ms-pacientes
		$forwardPath = $path; // $path ya incluye /pacientes y cualquier subruta
		$serviceUrl .= '/' . $forwardPath;
	} else if ($serviceKey === 'sesiones') {
		// Siempre reenviamos la ruta completa a ms-sesiones
		$forwardPath = $path; // $path ya incluye /sesiones y cualquier subruta
		$serviceUrl .= '/' . $forwardPath;
	} else if ($serviceKey === 'users') {
		// Siempre reenviamos la ruta completa a ms-users
		$forwardPath = $path; // $path ya incluye /users y cualquier subruta
		$serviceUrl .= '/' . $forwardPath;
	} else if ($serviceKey === 'terapias') {
		// Siempre reenviamos la ruta completa a ms-terapias
		$forwardPath = $path; // $path ya incluye /terapias y cualquier subruta
		$serviceUrl .= '/' . $forwardPath;
	} else {
		$serviceUrl .= $subPath ? '/' . $subPath : '';
	}
	$queryString = $_SERVER['QUERY_STRING'] ?? '';
	if ($queryString) {
		$serviceUrl .= '?' . $queryString;
	}

	// Log de depuración para ver la URL de destino
	file_put_contents(__DIR__ . '/gateway.log', date('Y-m-d H:i:s') . " - Reenviando a: $serviceUrl\n", FILE_APPEND);

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
	// Reenviar headers CORS en todas las respuestas
	if (isset($_SERVER['HTTP_ORIGIN'])) {
		header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Max-Age: 86400');
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