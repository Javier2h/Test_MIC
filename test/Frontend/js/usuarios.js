// usuarios.js
// Solo muestra id_usuario, nombre_usuario y rol

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
        tableBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
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
                    <td class="actions-btns">
                        <button class="action-btn" onclick="editUsuario(${usuario.id_usuario}, '${usuario.nombre_usuario.replace(/'/g, "&#39;")}', '${usuario.rol}')">Editar</button>
                        <button class="action-btn" onclick="deleteUsuario(${usuario.id_usuario})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="4">Error al cargar datos</td></tr>';
        }
    }

    window.editUsuario = function(id, nombre_usuario, rol) {
        editId = id;
        form.id_usuario.value = id;
        form.nombre_usuario.value = nombre_usuario;
        document.getElementById('rol').value = rol;
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
            contrasena: form.contrasena ? form.contrasena.value : '',
            rol: document.getElementById('rol').value,
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
                    if (form.contrasena) form.contrasena.value = '';
                } else {
                    showMessage('Error al actualizar', 'error');
                }
            })
            .catch(() => showMessage('Error al actualizar', 'error'));
        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => {
                if (r.status === 201) {
                    showMessage('Usuario agregado');
                    fetchUsuarios();
                    clearForm();
                    if (form.contrasena) form.contrasena.value = '';
                    return r.json();
                } else {
                    showMessage('Error al agregar', 'error');
                    return Promise.reject();
                }
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    fetchUsuarios();
});
