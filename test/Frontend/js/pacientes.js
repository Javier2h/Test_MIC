// pacientes.js
// Lógica para gestionar pacientes (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pacienteForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('pacientesTableBody');
    const apiUrl = 'http://192.168.100.177:8000/pacientes';
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

    async function fetchPacientes() {
        tableBody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('No se encontró token de autenticación. Inicie sesión.', 'error');
            alert('No se encontró token de autenticación. Inicie sesión.');
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
                alert('Tu rol no tiene permitido realizar esta acción.');
                tableBody.innerHTML = '<tr><td colspan="8">Acceso denegado por rol</td></tr>';
                return;
            }
            const userRole = localStorage.getItem('role');
            tableBody.innerHTML = '';
            (data || []).forEach(pac => {
                tableBody.innerHTML += `
                <tr>
                    <td>${pac.id_paciente}</td>
                    <td>${pac.nombre_completo}</td>
                    <td>${pac.fecha_nacimiento}</td>
                    <td>${pac.genero}</td>
                    <td>${pac.telefono}</td>
                    <td>${pac.correo}</td>
                    <td>${pac.direccion}</td>
                    ${userRole !== 'Supervisor' ? `<td class="actions-btns">
                        <button onclick="editPaciente(${pac.id_paciente}, '${pac.nombre_completo.replace(/'/g, "&#39;")}', '${pac.fecha_nacimiento}', '${pac.genero}', '${pac.telefono}', '${pac.correo}', '${pac.direccion.replace(/'/g, "&#39;")}')">Editar</button>
                        <button onclick="deletePaciente(${pac.id_paciente})">Eliminar</button>
                    </td>` : ''}
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="8">Error al cargar datos</td></tr>';
        }
    }

    window.editPaciente = function(id, nombre_completo, fecha_nacimiento, genero, telefono, correo, direccion) {
        editId = id;
        form.id_paciente.value = id;
        form.nombre_completo.value = nombre_completo;
        form.fecha_nacimiento.value = fecha_nacimiento;
        form.genero.value = genero;
        form.telefono.value = telefono;
        form.correo.value = correo;
        form.direccion.value = direccion;
        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deletePaciente = function(id) {
        if (confirm('¿Seguro que deseas eliminar este paciente?')) {
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
                    showMessage('Paciente eliminado');
                    fetchPacientes();
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
        const userRole = localStorage.getItem('role');
        if (userRole === 'Supervisor') {
            showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
            alert('Tu rol no tiene permitido realizar esta acción.');
            return;
        }
        const data = {
            nombre_completo: form.nombre_completo.value,
            fecha_nacimiento: form.fecha_nacimiento.value,
            genero: form.genero.value,
            telefono: form.telefono.value,
            correo: form.correo.value,
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
                    showMessage('Paciente actualizado');
                    fetchPacientes();
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
                    showMessage('Paciente agregado');
                    fetchPacientes();
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

    fetchPacientes();
    if (localStorage.getItem('role') === 'Supervisor') {
        form.style.display = 'none';
    }
});
