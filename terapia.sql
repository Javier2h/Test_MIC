-- Crear base de datos (opcional)
CREATE DATABASE IF NOT EXISTS centro_terapias;
USE centro_terapias;

-- 1. Pacientes
CREATE TABLE Pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(200)
);

-- 2. Terapeutas
CREATE TABLE Terapeutas (
    id_terapeuta INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);

-- 3. Terapias
CREATE TABLE Terapias (
    id_terapia INT AUTO_INCREMENT PRIMARY KEY,
    nombre_terapia VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT,
    precio DECIMAL(10,2)
);

-- 4. Sesiones
CREATE TABLE Sesiones (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_terapeuta INT NOT NULL,
    id_terapia INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    notas TEXT,
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id_paciente),
    FOREIGN KEY (id_terapeuta) REFERENCES Terapeutas(id_terapeuta),
    FOREIGN KEY (id_terapia) REFERENCES Terapias(id_terapia)
);

-- 5. Pagos
CREATE TABLE Pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    FOREIGN KEY (id_sesion) REFERENCES Sesiones(id_sesion)
);

-- 6. Productos
CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    stock INT,
    precio_unitario DECIMAL(10,2)
);

-- 7. UsoProducto
CREATE TABLE UsoProducto (
    id_uso INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_usada INT NOT NULL,
    FOREIGN KEY (id_sesion) REFERENCES Sesiones(id_sesion),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

Create table usuarios (
    id_usuario int primary key auto_increment,
    nombre_usuario varchar(100),
    contrasena varchar(255),
    rol varchar(50)
);


--- Insert de datos ---
-- Inserts para Pacientes
INSERT INTO Pacientes (nombre_completo, fecha_nacimiento, genero, telefono, correo, direccion) VALUES
('Ana López', '1990-05-12', 'Femenino', '555-1111', 'ana.lopez@email.com', 'Calle 1#123'),
('Carlos Pérez', '1985-08-23', 'Masculino', '555-2222', 'carlos.perez@email.com', 'Avenida 2#456');

-- Inserts para Terapeutas
INSERT INTO Terapeutas (nombre_completo, especialidad, telefono, correo) VALUES
('Laura Martínez', 'Fisioterapia', '555-3333', 'laura.martinez@email.com'),
('Miguel Torres', 'Psicología', '555-4444', 'miguel.torres@email.com');

-- Inserts para Terapias
INSERT INTO Terapias (nombre_terapia, descripcion, duracion_minutos, precio) VALUES
('Masaje Relajante', 'Masaje para aliviar el estrés', 60, 30.00),
('Terapia Cognitiva', 'Sesiones de psicoterapia', 45, 40.00);

-- Inserts para Sesiones
INSERT INTO Sesiones (id_paciente, id_terapeuta, id_terapia, fecha, hora, notas) VALUES
(1, 1, 1, '2025-08-10', '10:00:00', 'Paciente llegó puntual.'),
(2, 2, 2, '2025-08-11', '11:30:00', 'Primera sesión, paciente motivado.');

-- Inserts para Pagos
INSERT INTO Pagos (id_sesion, fecha_pago, monto, metodo_pago) VALUES
(1, '2025-08-10', 30.00, 'Efectivo'),
(2, '2025-08-11', 40.00, 'Tarjeta');

-- Inserts para Productos
INSERT INTO Productos (nombre_producto, descripcion, stock, precio_unitario) VALUES
('Aceite Esencial', 'Aceite para masajes', 20, 5.00),
('Vela Aromática', 'Vela para ambientar la sala', 15, 3.50);

-- Inserts para UsoProducto
INSERT INTO UsoProducto (id_sesion, id_producto, cantidad_usada) VALUES
(1, 1, 2),
(1, 2, 1),
(2, 1, 1);

Insert into usuarios (id_usuario, nombre_usuario, contrasena, rol) values
(1, 'administrador', '$2y$10$CR3VnVWDH7DZbqr5mKPV5uZz3DO6s0jHcfUYXzN43YjQ0k82X.psC', 'Administrador'),



--- Creacion de Usuarios y privilegios ---

-- Usuarios MySQL
CREATE USER 'Administrador'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'Desarrollador'@'localhost' IDENTIFIED BY 'desarrollador';
CREATE USER 'Supervisor'@'localhost' IDENTIFIED BY 'supervisor';


-- Otorgar todos los privilegios sobre toda la base de datos
GRANT ALL PRIVILEGES ON centro_terapias.* TO 'Administrador'@'localhost';

-- Otorgar permisos SELECT, INSERT, UPDATE, DELETE en todas las tablas relevantes
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Pacientes TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Sessiones TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Terapeutas TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Terapias TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.usuarios TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Pagos TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.Productos TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE ON centro_terapias.UsoProductoProductos TO 'Desarrollador'@'localhost';



-- Permisos de solo lectura para todas las tablas del sistema
GRANT SELECT ON centro_terapias.Pacientes TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.Sessiones TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.Terapeutas TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.Terapias TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.usuarios TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.Pagos TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.Productos TO 'Supervisor'@'localhost';
GRANT SELECT ON centro_terapias.UsoProductoProductos TO 'Supervisor'@'localhost';