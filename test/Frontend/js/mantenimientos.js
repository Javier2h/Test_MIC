// mantenimientos.js
// Lógica para gestionar mantenimientos (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mantenimientoForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('mantenimientosTableBody');
    const selectAtracciones = form.querySelector('select[name="id_atracciones"]');
    const apiUrl = 'http://localhost:8000/mantenimientos';
    const atraccionesUrl = 'http://localhost:8000/atracciones';

    // Cargar atracciones en el select
    fetch(atraccionesUrl)
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) {
                data.forEach(a => {
                    const option = document.createElement('option');
                    option.value = a.id_atracciones;
                    option.textContent = a.nombre;
                    selectAtracciones.appendChild(option);
                });
            }
        });

    // Mostrar mantenimientos al cargar
    fetchMantenimientos();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        if (form.hasAttribute('data-edit-id')) {
            // Actualizar
            const id = form.getAttribute('data-edit-id');
            fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => { if (r.status === 204) return null; else return r.json(); })
            .then(() => {
                showMessage('Mantenimiento actualizado');
                form.reset();
                fetchMantenimientos();
            })
            .catch(() => showMessage('Error al actualizar', true));
        } else {
            // Agregar
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(res => {
                showMessage('Mantenimiento agregado correctamente');
                form.reset();
                fetchMantenimientos();
            })
            .catch(() => showMessage('Error al agregar mantenimiento', true));
        }
    });

    function fetchMantenimientos() {
        fetch(apiUrl)
            .then(r => r.json())
            .then(data => renderTable(data))
            .catch(() => showMessage('Error al cargar mantenimientos', true));
    }

    function renderTable(mantenimientos) {
        tableBody.innerHTML = '';
        if (!Array.isArray(mantenimientos)) return;
        mantenimientos.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.id_mantenimiento}</td>
                <td>${m.nombre_atraccion || ''}</td>
                <td>${m.fecha || ''}</td>
                <td>${m.descripcion_mant || ''}</td>
                <td>
                    <button onclick="editarMantenimiento(${m.id_mantenimiento})">Editar</button>
                    <button onclick="eliminarMantenimiento(${m.id_mantenimiento})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.eliminarMantenimiento = function(id) {
        if (!confirm('¿Seguro que deseas eliminar este mantenimiento?')) return;
        fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
            .then(r => { if (r.status === 204) return null; else return r.json(); })
            .then(() => {
                showMessage('Mantenimiento eliminado');
                fetchMantenimientos();
            })
            .catch(() => showMessage('Error al eliminar', true));
    };

    window.editarMantenimiento = function(id) {
        fetch(`${apiUrl}/${id}`)
            .then(r => r.json())
            .then(m => {
                selectAtracciones.value = m.id_atracciones;
                form.fecha.value = m.fecha;
                form.descripcion_mant.value = m.descripcion_mant || '';
                form.setAttribute('data-edit-id', id);
                form.querySelector('[name="submitBtn"]').textContent = 'Actualizar';
            });
    };

    form.addEventListener('reset', function() {
        form.removeAttribute('data-edit-id');
        form.querySelector('[name="submitBtn"]').textContent = 'Agregar';
    });

    function showMessage(msg, error = false) {
        messageDiv.textContent = msg;
        messageDiv.style.color = error ? 'red' : 'green';
        setTimeout(() => messageDiv.textContent = '', 3000);
    }
});
