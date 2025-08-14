// ordenes.js
// Lógica para gestionar órdenes (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ordenForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('ordenesTableBody');
    const apiUrl = 'http://192.168.100.2:8000/ordenes';
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

    async function fetchOrdenes() {
        tableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
        try {
            const res = await fetch(apiUrl);
            const data = await res.json();
            tableBody.innerHTML = '';
            (data || []).forEach(ord => {
                tableBody.innerHTML += `
                <tr>
                    <td>${ord.id_orden}</td>
                    <td>${ord.id_cliente}</td>
                    <td>${ord.fecha_orden}</td>
                    <td>${ord.total}</td>
                    <td class="actions-btns">
                        <button onclick="editOrden(${ord.id_orden}, ${ord.id_cliente}, '${ord.fecha_orden}', ${ord.total})">Editar</button>
                        <button onclick="deleteOrden(${ord.id_orden})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
        }
    }

    async function cargarClientes() {
        const select = document.getElementById('id_cliente');
        try {
            const res = await fetch('http://localhost:8000/clientes');
            const clientes = await res.json();
            select.innerHTML = '<option value="">Seleccione un cliente</option>';
            clientes.forEach(cli => {
                select.innerHTML += `<option value="${cli.id_cliente}">${cli.nombre_cliente} (${cli.id_cliente})</option>`;
            });
        } catch {
            select.innerHTML = '<option value="">Error al cargar clientes</option>';
        }
    }

    window.editOrden = function(id, id_cliente, fecha_orden, total) {
        editId = id;
        form.id_orden.value = id;
        form.id_cliente.value = id_cliente;
        form.fecha_orden.value = fecha_orden.slice(0,16); // formato para input datetime-local
        form.total.value = total;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteOrden = function(id) {
        if (confirm('¿Seguro que deseas eliminar esta orden?')) {
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => {
                    showMessage('Orden eliminada');
                    fetchOrdenes();
                    clearForm();
                })
                .catch(() => showMessage('Error al eliminar', 'error'));
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            id_cliente: parseInt(form.id_cliente.value),
            fecha_orden: form.fecha_orden.value.replace('T', ' ')+':00', // formato datetime
            total: parseFloat(form.total.value)
        };
        if (editId) {
            fetch(`${apiUrl}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => {
                if (r.ok) {
                    showMessage('Orden actualizada');
                    fetchOrdenes();
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
                showMessage('Orden agregada');
                fetchOrdenes();
                clearForm();
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    cargarClientes();
    fetchOrdenes();
});
