// productos.js
// Lógica para gestionar productos (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productoForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('productosTableBody');
    const apiUrl = 'http://192.168.100.2:8000/productos';
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

    async function fetchProductos() {
        tableBody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';
        try {
            const res = await fetch(apiUrl);
            const data = await res.json();
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
        form.id_categoria.value = id_categoria;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteProducto = function(id) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => {
                    showMessage('Producto eliminado');
                    fetchProductos();
                    clearForm();
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
        if (editId) {
            fetch(`${apiUrl}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => {
                if (r.ok) {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(() => {
                showMessage('Producto agregado');
                fetchProductos();
                clearForm();
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    fetchProductos();
});
