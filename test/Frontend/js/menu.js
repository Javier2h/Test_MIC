document.addEventListener('DOMContentLoaded', function() {
	const links = document.querySelectorAll('.menu-list a');
	links.forEach(link => {
		link.addEventListener('click', function(e) {
			// Aquí puedes agregar lógica para navegación SPA o validación de sesión
			// Por ahora, solo navega normalmente
		});
	});
});
