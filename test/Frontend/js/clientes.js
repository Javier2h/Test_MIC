// clientes.js
// Lógica para gestionar clientes (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clienteForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('clientesTableBody');
    const apiUrl = 'http://192.168.100.177:8000/clientes';
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

    async function fetchClientes() {
        tableBody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('No se encontró token de autenticación. Inicie sesión.', 'error');
            alert('No se encontró token de autenticación. Inicie sesión.');
            tableBody.innerHTML = '<tr><td colspan="6">Sin autenticación</td></tr>';
            return;
        }
        try {
            const res = await fetch(apiUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            let data;
            try { data = await res.json(); } catch { data = null; }
            if (data && data.error && (data.error.includes('Rol no autorizado') || data.error.includes('Permiso denegado') || data.error.includes('no permitido'))) {
                showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                alert('Tu rol no tiene permitido realizar esta acción.');
                tableBody.innerHTML = '<tr><td colspan="6">Acceso denegado por rol</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            (data || []).forEach(cli => {
                tableBody.innerHTML += `
                <tr>
                    <td>${cli.id_cliente}</td>
                    <td>${cli.nombre_cliente}</td>
                    <td>${cli.correo}</td>
                    <td>${cli.telefono}</td>
                    <td>${cli.direccion}</td>
                    <td class="actions-btns">
                        <button onclick="editCliente(${cli.id_cliente}, '${cli.nombre_cliente.replace(/'/g, "&#39;")}', '${cli.correo}', '${cli.telefono}', '${cli.direccion.replace(/'/g, "&#39;")}')">Editar</button>
                        <button onclick="deleteCliente(${cli.id_cliente})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="6">Error al cargar datos</td></tr>';
        }
    }

    window.editCliente = function(id, nombre_cliente, correo, telefono, direccion) {
        editId = id;
        form.id_cliente.value = id;
        form.nombre_cliente.value = nombre_cliente;
        form.correo.value = correo;
        form.telefono.value = telefono;
        form.direccion.value = direccion;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteCliente = function(id) {
        if (confirm('¿Seguro que deseas eliminar este cliente?')) {
            const token = localStorage.getItem('token');
            fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(async r => {
                let resp = null;
                try { resp = await r.json(); } catch {}
                if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                    showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                    alert('Tu rol no tiene permitido realizar esta acción.');
                } else if (r.ok) {
                    showMessage('Cliente eliminado');
                    fetchClientes();
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
            nombre_cliente: form.nombre_cliente.value,
            correo: form.correo.value,
            telefono: form.telefono.value,
            direccion: form.direccion.value
        };
        const token = localStorage.getItem('token');
        if (editId) {
            fetch(`${apiUrl}/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            })
            .then(async r => {
                let resp = null;
                try { resp = await r.json(); } catch {}
                if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                    showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                    alert('Tu rol no tiene permitido realizar esta acción.');
                } else if (r.ok) {
                    showMessage('Cliente actualizado');
                    fetchClientes();
                    clearForm();
                } else {
                    showMessage('Error al actualizar', 'error');
                }
            })
            .catch(() => showMessage('Error al actualizar', 'error'));
        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            })
            .then(async r => {
                let resp = null;
                try { resp = await r.json(); } catch {}
                if (r.status === 201 || r.ok) {
                    showMessage('Cliente agregado');
                    fetchClientes();
                    clearForm();
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

    fetchClientes();
});
