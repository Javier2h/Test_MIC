// productos.js
// Lógica para gestionar productos (CRUD)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productoForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('productosTableBody');
    const apiUrl = 'http://127.0.0.1:8000/productos';
    const categoriasUrl = 'http://127.0.0.1:8000/categorias';
    const selectCategoria = document.getElementById('id_categoria');
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

    async function cargarCategorias() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(categoriasUrl, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const categorias = await res.json();
            selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
            (categorias || []).forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre_categoria}</option>`;
            });
        } catch {
            selectCategoria.innerHTML = '<option value="">Error al cargar categorías</option>';
        }
    }

    async function fetchProductos() {
        tableBody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('No se encontró token de autenticación. Inicie sesión.', 'error');
            alert('No se encontró token de autenticación. Inicie sesión.');
            tableBody.innerHTML = '<tr><td colspan="7">Sin autenticación</td></tr>';
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
                tableBody.innerHTML = '<tr><td colspan="7">Acceso denegado por rol</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            (data || []).forEach(prod => {
                tableBody.innerHTML += `
                <tr>
                    <td>${prod.id_producto}</td>
                    <td>${prod.nombre_producto}</td>
                    <td>${prod.descripcion}</td>
                    <td>${prod.precio}</td>
                    <td>${prod.stock}</td>
                    <td>${prod.id_categoria}</td>
                    <td class="actions-btns">
                        <button onclick="editProducto(${prod.id_producto}, '${prod.nombre_producto.replace(/'/g, "&#39;")}', '${prod.descripcion.replace(/'/g, "&#39;")}', ${prod.precio}, ${prod.stock}, ${prod.id_categoria})">Editar</button>
                        <button onclick="deleteProducto(${prod.id_producto})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="7">Error al cargar datos</td></tr>';
        }
    }

    window.editProducto = function(id, nombre_producto, descripcion, precio, stock, id_categoria) {
        editId = id;
        form.id_producto.value = id;
        form.nombre_producto.value = nombre_producto;
        form.descripcion.value = descripcion;
        form.precio.value = precio;
        form.stock.value = stock;
        selectCategoria.value = id_categoria;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteProducto = function(id) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
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
                    showMessage('Producto eliminado');
                    fetchProductos();
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
            nombre_producto: form.nombre_producto.value,
            descripcion: form.descripcion.value,
            precio: parseFloat(form.precio.value),
            stock: parseInt(form.stock.value),
            id_categoria: parseInt(form.id_categoria.value)
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
                    showMessage('Producto actualizado');
                    fetchProductos();
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
                    showMessage('Producto agregado');
                    fetchProductos();
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

    cargarCategorias().then(fetchProductos);
});
