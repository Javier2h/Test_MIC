document.addEventListener('DOMContentLoaded', function() {
	const apiUrl = 'http://localhost:8000/atracciones';
	const form = document.getElementById('atraccionForm');
	const tableBody = document.getElementById('atraccionesTableBody');
	const messageDiv = document.getElementById('message');
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

	async function fetchAtracciones() {
		tableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
		try {
			const res = await fetch(apiUrl);
			const data = await res.json();
			tableBody.innerHTML = '';
			(data || []).forEach(atr => {
				tableBody.innerHTML += `
				<tr>
					<td>${atr.id_atracciones}</td>
					<td>${atr.nombre}</td>
					<td>${atr.descripcion || ''}</td>
					<td>${atr.estado}</td>
					<td class="actions-btns">
						<button onclick="editAtraccion(${atr.id_atracciones}, '${atr.nombre.replace(/'/g, "&#39;")}', '${(atr.descripcion||'').replace(/'/g, "&#39;")}', '${atr.estado}')">Editar</button>
						<button onclick="deleteAtraccion(${atr.id_atracciones})">Eliminar</button>
					</td>
				</tr>`;
			});
		} catch {
			tableBody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
		}
	}

	window.editAtraccion = function(id, nombre, descripcion, estado) {
		form['nombre'].value = nombre;
		form['descripcion'].value = descripcion;
		form['estado'].value = estado;
		editId = id;
		form['submitBtn'].textContent = 'Actualizar';
	};

	window.deleteAtraccion = async function(id) {
		if (!confirm('¿Seguro que deseas eliminar esta atracción?')) return;
		try {
			const res = await fetch(apiUrl + '/' + id, { method: 'DELETE' });
			if (res.ok) {
				showMessage('Atracción eliminada.');
				fetchAtracciones();
			} else {
				showMessage('Error al eliminar.', 'error');
			}
		} catch {
			showMessage('Error de conexión.', 'error');
		}
	};

	form.addEventListener('submit', async function(e) {
		e.preventDefault();
		const nombre = form['nombre'].value.trim();
		const descripcion = form['descripcion'].value.trim();
		const estado = form['estado'].value;
		if (!nombre) {
			showMessage('El nombre es obligatorio.', 'error');
			return;
		}
		const atraccion = { nombre, descripcion, estado };
		try {
			let res;
			if (editId) {
				res = await fetch(apiUrl + '/' + editId, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(atraccion)
				});
			} else {
				res = await fetch(apiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(atraccion)
				});
			}
			if (res.ok) {
				showMessage(editId ? 'Atracción actualizada.' : 'Atracción agregada.');
				clearForm();
				fetchAtracciones();
			} else {
				showMessage('Error al guardar.', 'error');
			}
		} catch {
			showMessage('Error de conexión.', 'error');
		}
	});

	fetchAtracciones();
});
