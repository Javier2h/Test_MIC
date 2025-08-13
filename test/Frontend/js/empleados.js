// empleados.js
// Lógica para gestionar empleados (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('empleadoForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('empleadosTableBody');
    const apiUrl = 'http://localhost:8000/empleados';

    // Mostrar empleados al cargar
    fetchEmpleados();

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
            .then(r => {
                if (r.status === 204) {
                    return null; // Sin contenido
                } else {
                    return r.json();
                }
            })
            .then(() => {
                showMessage('Empleado actualizado');
                form.reset();
                fetchEmpleados();
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
                showMessage('Empleado agregado correctamente');
                form.reset();
                fetchEmpleados();
            })
            .catch(() => showMessage('Error al agregar empleado', true));
        }
    });

    function fetchEmpleados() {
        fetch(apiUrl)
            .then(r => r.json())
            .then(data => renderTable(data))
            .catch(() => showMessage('Error al cargar empleados', true));
    }

    function renderTable(empleados) {
        tableBody.innerHTML = '';
        if (!Array.isArray(empleados)) return;
        empleados.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.id_empleado}</td>
                <td>${emp.nombre}</td>
                <td>${emp.direccion || ''}</td>
                <td>${emp.correo || ''}</td>
                <td>${emp.telefono || ''}</td>
                <td>
                    <button onclick="editarEmpleado(${emp.id_empleado})">Editar</button>
                    <button onclick="eliminarEmpleado(${emp.id_empleado})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.eliminarEmpleado = function(id) {
        if (!confirm('¿Seguro que deseas eliminar este empleado?')) return;
        fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
            .then(r => {
                if (r.status === 204) {
                    return null;
                } else {
                    return r.json();
                }
            })
            .then(() => {
                showMessage('Empleado eliminado');
                fetchEmpleados();
            })
            .catch(() => showMessage('Error al eliminar', true));
    };

    window.editarEmpleado = function(id) {
        fetch(`${apiUrl}/${id}`)
            .then(r => r.json())
            .then(emp => {
                form.nombre.value = emp.nombre;
                form.direccion.value = emp.direccion || '';
                form.correo.value = emp.correo || '';
                form.telefono.value = emp.telefono || '';
                form.setAttribute('data-edit-id', id);
                form.querySelector('[name="submitBtn"]').textContent = 'Actualizar';
            });
    };

    form.addEventListener('reset', function() {
        form.removeAttribute('data-edit-id');
        form.querySelector('[name="submitBtn"]').textContent = 'Agregar';
    });

    // ...el resto del código permanece igual...

    function showMessage(msg, error = false) {
        messageDiv.textContent = msg;
        messageDiv.style.color = error ? 'red' : 'green';
        setTimeout(() => messageDiv.textContent = '', 3000);
    }
});
