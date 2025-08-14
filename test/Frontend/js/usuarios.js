// usuarios.js
// Lógica para gestionar usuarios (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('usuarioForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('usuariosTableBody');
    const apiUrl = 'http://localhost:8000/users';
    let editId = null;

    function showMessage(msg, type = 'success') {
        messageDiv.textContent = msg;
        messageDiv.className = 'message ' + type;
        setTimeout(() => { messageDiv.textContent = ''; }, 2500);
    }

    function clearForm() {
        form.reset();
        editId = null;
        form['submitBtn'].textContent = 'Agregar';
    }

    async function fetchUsuarios() {
        tableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
        try {
            const res = await fetch(apiUrl);
            const data = await res.json();
            tableBody.innerHTML = '';
            (data || []).forEach(usuario => {
                tableBody.innerHTML += `
                <tr>
                    <td>${usuario.id_usuario}</td>
                    <td>${usuario.nombre_usuario}</td>
                    <td>${usuario.rol}</td>
                    <td>${usuario.estado}</td>
                    <td class="actions-btns">
                        <button onclick="editUsuario(${usuario.id_usuario}, '${usuario.nombre_usuario.replace(/'/g, "&#39;")}', '${usuario.rol}', '${usuario.estado}')">Editar</button>
                        <button onclick="deleteUsuario(${usuario.id_usuario})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
        }
    }

    window.editUsuario = function(id, nombre_usuario, rol, estado) {
        editId = id;
        form.id_usuario.value = id;
        form.nombre_usuario.value = nombre_usuario;
        form.rol.value = rol;
        form.estado.value = estado;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteUsuario = function(id) {
        if (confirm('¿Seguro que deseas eliminar este usuario?')) {
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => {
                    showMessage('Usuario eliminado');
                    fetchUsuarios();
                    clearForm();
                })
                .catch(() => showMessage('Error al eliminar', 'error'));
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            nombre_usuario: form.nombre_usuario.value,
            contrasena: form.contrasena.value,
            rol: form.rol.value,
            estado: form.estado.value
        };
        if (editId) {
            fetch(`${apiUrl}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => {
                if (r.ok) {
                    showMessage('Usuario actualizado');
                    fetchUsuarios();
                    clearForm();
                } else {
                    showMessage('Error al actualizar', 'error');
                }
            })
            .catch(() => showMessage('Error al actualizar', 'error'));
        } else {
            // Usar endpoint de registro para crear usuario con contraseña hasheada
            fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(() => {
                showMessage('Usuario agregado');
                fetchUsuarios();
                clearForm();
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    fetchUsuarios();
});
