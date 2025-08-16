document.addEventListener('DOMContentLoaded', function() {
	const apiUrl = 'http://127.0.0.1:8000/categorias';
	const form = document.getElementById('categoriaForm');
	const tableBody = document.getElementById('categoriasTableBody');
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

	async function fetchCategorias() {
		tableBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
		const token = localStorage.getItem('token');
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
				tableBody.innerHTML = '<tr><td colspan="3">Acceso denegado por rol</td></tr>';
				return;
			}
			tableBody.innerHTML = '';
			(data || []).forEach(cat => {
				tableBody.innerHTML += `
				<tr>
					<td>${cat.id_categoria}</td>
					<td>${cat.nombre_categoria}</td>
					<td class="actions-btns">
						<button onclick="editCategoria(${cat.id_categoria}, '${cat.nombre_categoria.replace(/'/g, "&#39;")}')">Editar</button>
						<button onclick="deleteCategoria(${cat.id_categoria})">Eliminar</button>
					</td>
				</tr>`;
			});
		} catch {
			tableBody.innerHTML = '<tr><td colspan="3">Error al cargar datos</td></tr>';
		}
	}

	window.editCategoria = function(id, nombre_categoria) {
		editId = id;
		form.id_categoria.value = id;
		form.nombre_categoria.value = nombre_categoria;
		form['submitBtn'].textContent = 'Actualizar';
	}

	window.deleteCategoria = function(id) {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
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
            if (r.ok) {
                showMessage('Categoría eliminada');
                fetchCategorias();
                clearForm();
            } else if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
                showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
                alert('Tu rol no tiene permitido realizar esta acción.');
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
			nombre_categoria: form.nombre_categoria.value
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
				if (r.ok) {
					showMessage('Categoría actualizada');
					fetchCategorias();
					clearForm();
				} else if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
					showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
					alert('Tu rol no tiene permitido realizar esta acción.');
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
					showMessage('Categoría agregada');
					fetchCategorias();
					clearForm();
				} else if (resp && resp.error && (resp.error.includes('Rol no autorizado') || resp.error.includes('Permiso denegado') || resp.error.includes('no permitido'))) {
					showMessage('Tu rol no tiene permitido realizar esta acción.', 'error');
					alert('Tu rol no tiene permitido realizar esta acción.');
				} else {
					showMessage('Error al agregar', 'error');
				}
			})
		}
	});

	fetchCategorias();
});
