// sessiones.js
// Lógica para gestionar sesiones (CRUD)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('sesionForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.getElementById('sesionesTableBody');
    const apiUrl = 'http://192.168.100.177:8000/sesiones';
    let editId = null;

    // Cargar opciones de pacientes, terapeutas y terapias
    async function cargarSelect(url, selectId, labelField) {
        const select = document.getElementById(selectId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await res.json();
            select.innerHTML = '<option value="">Seleccione</option>';
            (data || []).forEach(item => {
                const option = document.createElement('option');
                option.value = item[`id_${selectId.split('_')[1]}`];
                option.textContent = item[labelField];
                select.appendChild(option);
            });
        } catch {
            select.innerHTML = '<option value="">Error al cargar</option>';
        }
    }
    cargarSelect('http://192.168.100.177:8000/pacientes', 'id_paciente', 'nombre_completo');
    cargarSelect('http://192.168.100.177:8000/terapeutas', 'id_terapeuta', 'nombre_completo');
    cargarSelect('http://192.168.100.177:8000/terapias', 'id_terapia', 'nombre_terapia');

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

    async function fetchSesiones() {
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
            const userRole = localStorage.getItem('role');
            tableBody.innerHTML = '';
            (data || []).forEach(s => {
                tableBody.innerHTML += `
                <tr>
                    <td>${s.id_sesion}</td>
                    <td>${s.paciente || s.id_paciente}</td>
                    <td>${s.terapeuta || s.id_terapeuta}</td>
                    <td>${s.terapia || s.id_terapia}</td>
                    <td>${s.fecha}</td>
                    <td>${s.hora}</td>
                    <td>${s.notas || ''}</td>
                    ${userRole !== 'Supervisor' ? `<td class="actions-btns">
                        <button onclick="editSesion(${s.id_sesion}, ${s.id_paciente}, ${s.id_terapeuta}, ${s.id_terapia}, '${s.fecha}', '${s.hora}', '${(s.notas||'').replace(/'/g, "&#39;")}')">Editar</button>
                        <button onclick="deleteSesion(${s.id_sesion})">Eliminar</button>
                    </td>` : ''}
                </tr>`;
            });
        } catch {
            tableBody.innerHTML = '<tr><td colspan="7">Error al cargar datos</td></tr>';
        }
    }

    window.editSesion = function(id, id_paciente, id_terapeuta, id_terapia, fecha, hora, notas) {
        editId = id;
        form.id_sesion.value = id;
        form.id_paciente.value = id_paciente; // Set paciente field
        form.id_terapeuta.value = id_terapeuta; // Set terapeuta field
        form.id_terapia.value = id_terapia; // Set terapia field
        form.fecha.value = fecha;
        form.hora.value = hora;
        form.notas.value = notas;

        // Ensure the select fields are updated with the correct options
        cargarSelect('http://192.168.100.177:8000/pacientes', 'id_paciente', 'nombre_completo');
        cargarSelect('http://192.168.100.177:8000/terapeutas', 'id_terapeuta', 'nombre_completo');
        cargarSelect('http://192.168.100.177:8000/terapias', 'id_terapia', 'nombre_terapia');

        form['submitBtn'].textContent = 'Actualizar';
    }

    window.deleteSesion = function(id) {
        if (confirm('¿Seguro que deseas eliminar esta sesión?')) {
            const token = localStorage.getItem('token');
            fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(async r => {
                if (r.ok) {
                    showMessage('Sesión eliminada');
                    fetchSesiones();
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
            id_paciente: form.id_paciente.value,
            id_terapeuta: form.id_terapeuta.value,
            id_terapia: form.id_terapia.value,
            fecha: form.fecha.value,
            hora: form.hora.value,
            notas: form.notas.value
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
                if (r.ok) {
                    showMessage('Sesión actualizada');
                    fetchSesiones();
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
                if (r.status === 201 || r.ok) {
                    showMessage('Sesión agregada');
                    fetchSesiones();
                    clearForm();
                } else {
                    showMessage('Error al agregar', 'error');
                }
            })
            .catch(() => showMessage('Error al agregar', 'error'));
        }
    });

    // Completely hide the form and its buttons for Supervisor role
    if (localStorage.getItem('role') === 'Supervisor') {
        const form = document.getElementById('sesionForm');
        if (form) form.style.display = 'none';
    }

    fetchSesiones();
});