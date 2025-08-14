<?php
// permissions.php
// Define los permisos por rol y acción

function tienePermiso($rol, $accion) {
    $permisos = [
        'Administrador' => ['crear', 'editar', 'eliminar', 'ver'],
        'Desarrollador' => ['crear', 'editar', 'ver'],
        'Supervisor' => ['ver']
    ];
    return in_array($accion, $permisos[$rol] ?? []);
}
