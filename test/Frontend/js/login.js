document.getElementById('loginForm').addEventListener('submit', async function(e) {
	e.preventDefault();
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	const messageDiv = document.getElementById('message');
	messageDiv.textContent = '';
	messageDiv.className = 'message';

	try {
		const response = await fetch('http://192.168.100.2:8000/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ nombre_usuario: username, contrasena: password })
		});
		const data = await response.json();
		if (response.ok && data.token) {
			// Guardar el token, nombre de usuario y rol en localStorage
			localStorage.setItem('token', data.token);
			if (data.nombre_usuario) {
				localStorage.setItem('nombre_usuario', data.nombre_usuario);
			}
			if (data.rol) {
				localStorage.setItem('rol', data.rol);
			}
			messageDiv.textContent = '¡Login exitoso!';
			messageDiv.classList.add('success');
			alert('Login exitoso. Serás redirigido al menú principal.');
			window.location.href = 'menu.html';
		} else {
			messageDiv.textContent = data.error || 'Usuario o contraseña incorrectos';
			messageDiv.classList.add('error');
		}
	} catch (error) {
		messageDiv.textContent = 'Error de conexión con el servidor';
		messageDiv.classList.add('error');
	}
});
