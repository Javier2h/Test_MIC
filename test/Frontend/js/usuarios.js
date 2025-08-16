// usuarios.js
// Solo muestra id_usuario, nombre_usuario y rol

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('usuarioForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('usuariosTableBody');
    const apiUrl = 'http://192.168.100.177:8000/users';
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
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = null;
            }
            if (!res.ok && data && data.error && (data.error.includes('Rol no autorizado') || data.error.includes('Permiso denegado') || data.error.includes('no permitido'))) {
                showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                alert('Tu rol no tiene permitido realizar esta acción.');
                tableBody.innerHTML = '<tr><td colspan="4">Acceso denegado por rol</td></tr>';
                return;
            }
            if (data && data.error && (data.error.includes('Rol no autorizado') || data.error.includes('Permiso denegado') || data.error.includes('no permitido'))) {
                showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                alert('Tu rol no tiene permitido realizar esta acción.');
                tableBody.innerHTML = '<tr><td colspan="4">Acceso denegado por rol</td></tr>';
                return;
            }
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
            fetch(`${apiUrl}/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
                .then(async r => {
                    let resp = null;
                    try { resp = await r.json(); } catch {}
                    if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                        showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                        alert('Tu rol no tiene permitido realizar esta acción.');
                    } else if (r.ok) {
                        showMessage('Usuario eliminado');
                        fetchUsuarios();
                        clearForm();
                    } else {
                        showMessage('Error al eliminar', 'error');
                    }
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
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(async r => {
                let resp = null;
                try { resp = await r.json(); } catch {}
                if (r.ok) {
                    showMessage('Usuario actualizado');
                    fetchUsuarios();
                    clearForm();
                    if (form.contrasena) form.contrasena.value = '';
                } else if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                    showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                    alert('Tu rol no tiene permitido realizar esta acción.');
                } else {
                    showMessage('Error al actualizar', 'error');
                }
            })
            .catch(() => showMessage('Error al actualizar', 'error'));
        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(async r => {
                let resp = null;
                try { resp = await r.json(); } catch {}
                if (r.status === 201) {
                    showMessage('Usuario agregado');
                    fetchUsuarios();
                    clearForm();
                    if (form.contrasena) form.contrasena.value = '';
                    return resp;
                } else if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                    showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                    alert('Tu rol no tiene permitido realizar esta acción.');
                } else {
                    showMessage('Error al agregar', 'error');
                }
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    fetchUsuarios();
});
