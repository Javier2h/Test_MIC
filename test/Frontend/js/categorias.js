document.addEventListener('DOMContentLoaded', function() {
	const apiUrl = 'http://localhost:8000/categorias';
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
		try {
			const res = await fetch(apiUrl);
			const data = await res.json();
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
			fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
				.then(() => {
					showMessage('Categoría eliminada');
					fetchCategorias();
					clearForm();
				})
				.catch(() => showMessage('Error al eliminar', 'error'));
		}
	}

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		const data = {
			nombre_categoria: form.nombre_categoria.value
		};
		if (editId) {
			fetch(`${apiUrl}/${editId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			})
			.then(r => {
				if (r.ok) {
					showMessage('Categoría actualizada');
					fetchCategorias();
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
				showMessage('Categoría agregada');
				fetchCategorias();
				clearForm();
			})
			.catch(() => showMessage('Error al agregar', 'error'));
		}
	});

	fetchCategorias();
});
