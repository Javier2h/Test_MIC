// terapias.js
// Lógica para gestionar terapias (CRUD)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-terapias');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('tabla-terapias');
    const apiUrl = 'http://192.168.100.177:8000/terapias';
    let editId = null;

    function showMessage(msg, type = 'success') {
        messageDiv.textContent = msg;
        messageDiv.className = 'message ' + type;
        setTimeout(() => { messageDiv.textContent = ''; }, 2500);
    }

    function clearForm() {
        form.reset();
        editId = null;
        form.querySelector('button[type="submit"]').textContent = 'Agregar';
    }

    async function fetchTerapias() {
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
            (data || []).forEach(terapia => {
                tableBody.innerHTML += `
                <tr>
                    <td>${terapia.id_terapia}</td>
                    <td>${terapia.nombre_terapia}</td>
                    <td>${terapia.descripcion}</td>
                    <td>${terapia.duracion_minutos}</td>
                    <td>${terapia.precio}</td>
                    <td class="actions-btns">
                        <button onclick="editTerapia(${terapia.id_terapia}, '${terapia.nombre_terapia.replace(/'/g, "&#39;")}', '${terapia.descripcion.replace(/'/g, "&#39;")}', ${terapia.duracion_minutos}, ${terapia.precio})">Editar</button>
                        <button onclick="deleteTerapia(${terapia.id_terapia})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="6">Error al cargar datos</td></tr>';
        }
    }

    window.editTerapia = function(id, nombre_terapia, descripcion, duracion_minutos, precio) {
        editId = id;
        form.nombre_terapia.value = nombre_terapia;
        form.descripcion.value = descripcion;
        form.duracion_minutos.value = duracion_minutos;
        form.precio.value = precio;
        form.querySelector('button[type="submit"]').textContent = 'Actualizar';
    }

    window.deleteTerapia = function(id) {
        if (confirm('¿Seguro que deseas eliminar esta terapia?')) {
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
                    showMessage('Terapia eliminada');
                    fetchTerapias();
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
            nombre_terapia: form.nombre_terapia.value,
            descripcion: form.descripcion.value,
            duracion_minutos: form.duracion_minutos.value,
            precio: form.precio.value
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
                    showMessage('Terapia actualizada');
                    fetchTerapias();
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
                    showMessage('Terapia agregada');
                    fetchTerapias();
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

    fetchTerapias();
});
