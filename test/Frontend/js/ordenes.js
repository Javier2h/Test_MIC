// ordenes.js
// Lógica para gestionar órdenes (CRUD)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ordenForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('ordenesTableBody');
    const apiUrl = 'http://192.168.100.177:8000/ordenes';
    const clientesUrl = 'http://192.168.100.177:8000/clientes';
    const productosUrl = 'http://192.168.100.177:8000/productos';
    const selectCliente = document.getElementById('id_cliente');
    const selectProducto = document.getElementById('id_producto');
    const cantidadInput = document.getElementById('cantidad');
    const totalInput = document.getElementById('total');
    let productosCache = [];
    let clientesCache = [];
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

    async function cargarClientes() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(clientesUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const clientes = await res.json();
            clientesCache = clientes || [];
            selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
            clientesCache.forEach(cli => {
                selectCliente.innerHTML += `<option value="${cli.id_cliente}">${cli.nombre_cliente}</option>`;
            });
        } catch {
            selectCliente.innerHTML = '<option value="">Error al cargar clientes</option>';
        }
    }

    async function cargarProductos() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(productosUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const productos = await res.json();
            productosCache = productos || [];
            selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
            productosCache.forEach(prod => {
                selectProducto.innerHTML += `<option value="${prod.id_producto}" data-precio="${prod.precio}">${prod.nombre_producto}</option>`;
            });
        } catch {
            selectProducto.innerHTML = '<option value="">Error al cargar productos</option>';
        }
    }
    // Calcular total automáticamente
    function calcularTotal() {
        const idProd = parseInt(selectProducto.value);
        const cantidad = parseInt(cantidadInput.value) || 0;
        const producto = productosCache.find(p => p.id_producto === idProd);
        if (producto && cantidad > 0) {
            totalInput.value = (producto.precio * cantidad).toFixed(2);
        } else {
            totalInput.value = '';
        }
    }

    selectProducto.addEventListener('change', calcularTotal);
    cantidadInput.addEventListener('input', calcularTotal);

    async function fetchOrdenes() {
        tableBody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('No se encontró token de autenticación. Inicie sesión.', 'error');
            tableBody.innerHTML = '<tr><td colspan="8">Sin autenticación</td></tr>';
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
                tableBody.innerHTML = '<tr><td colspan="8">Acceso denegado por rol</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            (data || []).forEach(ord => {
                const cliente = clientesCache.find(c => c.id_cliente === ord.id_cliente);
                const producto = productosCache.find(p => p.id_producto === ord.id_producto);
                tableBody.innerHTML += `
                <tr>
                    <td>${ord.id_orden}</td>
                    <td>${cliente ? cliente.nombre_cliente : ord.id_cliente}</td>
                    <td>${producto ? producto.nombre_producto : ord.id_producto}</td>
                    <td>${ord.fecha_orden}</td>
                    <td>${ord.cantidad}</td>
                    <td>${ord.total}</td>
                    <td>${ord.estado}</td>
                    <td class="actions-btns">
                        <button onclick="editOrden(${ord.id_orden}, ${ord.id_cliente}, ${ord.id_producto}, '${ord.fecha_orden}', ${ord.cantidad}, ${ord.total}, '${ord.estado}')">Editar</button>
                        <button onclick="deleteOrden(${ord.id_orden})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="8">Error al cargar datos</td></tr>';
        }
    }

    window.editOrden = function(id, id_cliente, id_producto, fecha_orden, cantidad, total, estado) {
        editId = id;
        form.id_orden.value = id;
        selectCliente.value = id_cliente;
        selectProducto.value = id_producto;
        form.fecha_orden.value = fecha_orden.replace(' ', 'T');
        cantidadInput.value = cantidad;
        setTimeout(calcularTotal, 100); // Esperar a que el producto esté seleccionado
        form.estado.value = estado;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteOrden = function(id) {
        if (confirm('¿Seguro que deseas eliminar esta orden?')) {
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
                    showMessage('Orden eliminada');
                    fetchOrdenes();
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
            id_cliente: parseInt(selectCliente.value),
            id_producto: parseInt(selectProducto.value),
            fecha_orden: form.fecha_orden.value.replace('T', ' '),
            cantidad: parseInt(cantidadInput.value),
            total: parseFloat(totalInput.value),
            estado: form.estado.value
        };
        const token = localStorage.getItem('token');
        if (editId) {
            // === SECCIÓN EDITAR ORDEN (PUT) ===
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
                    showMessage('Orden actualizada');
                    fetchOrdenes();
                    clearForm();
                } else {
                    showMessage('Error al actualizar', 'error');
                }
            })
            .catch(() => showMessage('Error al actualizar', 'error'));
        } else {
            // === SECCIÓN CREAR ORDEN (POST) ===
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
                // Debug: mostrar respuesta completa del backend
                console.log('Respuesta POST orden:', r.status, resp);
                if (r.status === 201 || r.ok) {
                    showMessage('Orden agregada');
                    fetchOrdenes();
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

    // Hacer el campo total solo lectura
    totalInput.readOnly = true;

    cargarClientes().then(cargarProductos).then(fetchOrdenes);
});