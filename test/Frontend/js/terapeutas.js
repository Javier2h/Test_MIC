document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-terapeutas');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('tabla-terapeutas');
    const apiUrl = 'http://192.168.100.177:8000/terapeutas';
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

    async function fetchTerapeutas() {
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
            (data || []).forEach(terapeuta => {
                tableBody.innerHTML += `
                <tr>
                    <td>${terapeuta.id_terapeuta}</td>
                    <td>${terapeuta.nombre_completo}</td>
                    <td>${terapeuta.especialidad}</td>
                    <td>${terapeuta.telefono}</td>
                    <td>${terapeuta.correo}</td>
                    <td class="actions-btns">
                        <button onclick="editTerapeuta(${terapeuta.id_terapeuta}, '${terapeuta.nombre_completo.replace(/'/g, "&#39;")}', '${terapeuta.especialidad}', '${terapeuta.telefono}', '${terapeuta.correo}')">Editar</button>
                        <button onclick="deleteTerapeuta(${terapeuta.id_terapeuta})">Eliminar</button>
                    </td>
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="6">Error al cargar datos</td></tr>';
        }
    }

    window.editTerapeuta = function(id, nombre_completo, especialidad, telefono, correo) {
        editId = id;
        form.nombre_completo.value = nombre_completo;
        form.especialidad.value = especialidad;
        form.telefono.value = telefono;
        form.correo.value = correo;
        form.querySelector('button[type="submit"]').textContent = 'Actualizar';
    }

    window.deleteTerapeuta = function(id) {
        if (confirm('¿Seguro que deseas eliminar este terapeuta?')) {
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
                    showMessage('Terapeuta eliminado');
                    fetchTerapeutas();
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
            nombre_completo: form.nombre_completo.value,
            especialidad: form.especialidad.value,
            telefono: form.telefono.value,
            correo: form.correo.value
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
                    showMessage('Terapeuta actualizado');
                    fetchTerapeutas();
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
                    showMessage('Terapeuta agregado');
                    fetchTerapeutas();
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

    fetchTerapeutas();
});
