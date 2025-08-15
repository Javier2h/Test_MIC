// clientes.js
// Lógica para gestionar clientes (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clienteForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('clientesTableBody');
    const apiUrl = 'http://192.168.100.2:8000/clientes';
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
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await res.json();
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
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => {
                    showMessage('Cliente eliminado');
                    fetchClientes();
                    clearForm();
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
        if (editId) {
            fetch(`${apiUrl}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => {
                if (r.ok) {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(() => {
                showMessage('Cliente agregado');
                fetchClientes();
                clearForm();
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    fetchClientes();
});
