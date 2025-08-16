-- Create  database 
Create database panaderia2;

--- crear tablas
Create table clientes (
    id_cliente int primary key auto_increment,
    nombre_cliente varchar(100),
    correo varchar(100),
    telefono varchar(15),
    direccion varchar(255)
);

Create table ordenes (
    id_orden int primary key auto_increment,
    id_cliente int,
    id_producto int,
    fecha_orden datetime,
    cantidad int,
    total decimal(10, 2),
    estado varchar(50),
    foreign key (id_cliente) references clientes(id_cliente),
    foreign key (id_producto) references productos(id_producto)
);

Create table categorias (
    id_categoria int primary key auto_increment,
    nombre_categoria varchar(100)
);

Create table productos (
    id_producto int primary key auto_increment,
    nombre_producto varchar(100),
    descripcion text,
    precio decimal(10, 2),
    stock int,
    id_categoria int,
    foreign key (id_categoria) references categorias(id_categoria)
);

Create table usuarios (
    id_usuario int primary key auto_increment,
    nombre_usuario varchar(100),
    contrasena varchar(255),
    rol varchar(50)
);


--- Insert de datos ---
Insert into clientes (id_cliente, nombre_cliente, correo, telefono, direccion) values
(1, 'Juan Perez', 'juan.perez@example.com', '555-1234', 'Calle Falsa 123'),
(2, 'Maria Gomez', 'maria.gomez@example.com', '555-5678', 'Avenida Siempre Viva 742'),
(3, 'Luis Rodriguez', 'luis.rodriguez@example.com', '555-8765', 'Boulevard de los Sueños Rotos 456');

Insert into ordenes (id_cliente,id_producto,fecha_orden,cantidad,total,estado) values
( 1, 1, '2023-10-01 10:00:00',2, 599.99, 'Pendiente'),
( 2, 2, '2023-10-02 11:30:00',1, 799.99, 'Completada'),
( 3, 3, '2023-10-03 14:15:00',2, 99.99, 'Cancelada');

Insert into categorias (id_categoria, nombre_categoria) values
(1, 'Electrónica'),
(2, 'Ropa'),
(3, 'Hogar');

Insert into productos (id_producto, nombre_producto, descripcion, precio, stock, id_categoria) values
(1, 'Smartphone', 'Teléfono inteligente con pantalla de 6.5 pulgadas', 299.99, 50, 1),
(2, 'Laptop', 'Laptop ultradelgada con 16GB de RAM', 799.99, 30, 1),
(3, 'Camiseta', 'Camiseta de algodón 100%', 19.99, 100, 2),
(4, 'Sofá', 'Sofá de tres plazas con tela resistente', 499.99, 20, 3);

Insert into usuarios (id_usuario, nombre_usuario, contrasena, rol) values
(1, 'administrador', 'admin', 'Administrador'),



--- Creacion de Usuarios y privilegios ---

-- Usuarios MySQL
CREATE USER 'Administrador'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'Desarrollador'@'localhost' IDENTIFIED BY 'desarrollador';
CREATE USER 'Supervisor'@'localhost' IDENTIFIED BY 'supervisor';


-- Otorgar todos los privilegios sobre toda la base de datos
GRANT ALL PRIVILEGES ON panaderia2.* TO 'Administrador'@'localhost';

-- Otorgar permisos SELECT, INSERT, UPDATE, DELETE en todas las tablas relevantes
GRANT SELECT, INSERT, UPDATE, DELETE ON panaderia2.clientes TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON panaderia2.ordenes TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON panaderia2.categorias TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON panaderia2.productos TO 'Desarrollador'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON panaderia2.usuarios TO 'Desarrollador'@'localhost';

-- Permisos de solo lectura para todas las tablas del sistema
GRANT SELECT ON panaderia2.clientes TO 'Supervisor'@'localhost';
GRANT SELECT ON panaderia2.ordenes TO 'Supervisor'@'localhost';
GRANT SELECT ON panaderia2.categorias TO 'Supervisor'@'localhost';
GRANT SELECT ON panaderia2.productos TO 'Supervisor'@'localhost';
GRANT SELECT ON panaderia2.usuarios TO 'Supervisor'@'localhost';