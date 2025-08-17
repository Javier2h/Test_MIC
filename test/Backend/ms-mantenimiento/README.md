# Atracciones Microservicio

Este microservicio en PHP permite la gestión de atracciones mediante una API RESTful. Está preparado para ser gestionado por un API Gateway.

## Endpoints principales
- `GET /atracciones` - Listar todas las atracciones
- `GET /atracciones/{id}` - Obtener una atracción por ID
- `POST /atracciones` - Crear una nueva atracción
- `PUT /atracciones/{id}` - Actualizar una atracción existente
- `DELETE /atracciones/{id}` - Eliminar una atracción

## Estructura de la tabla
```sql
CREATE TABLE atracciones (
    id_atracciones INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ENUM('Activo', 'En Mantenimiento', 'Inactivo') DEFAULT 'Activo'
);
```

## Requisitos
- PHP >= 7.4
- Composer
- MySQL

## Instalación
1. Clona este repositorio
2. Instala dependencias con Composer
3. Configura la conexión a la base de datos en `config.php`

## Uso
Ejecuta el servidor embebido de PHP:
```
php -S localhost:8080 -t public
```

