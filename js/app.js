/**
 * Archivo principal de la aplicación Acme School.
 * Controla la navegación entre módulos y protege las vistas privadas.
 */
import { inicializarDatos, obtenerUsuarioActivo } from './storage.js';
import './navbar.js';
import './login.js';
import './usuarios.js';
import './examenesAdmin.js';
import './examenPublico.js';

inicializarDatos();

const contenedorApp = document.getElementById('app');

function mostrarVista(vista) {
  const usuario = obtenerUsuarioActivo();

  // Protección de rutas privadas: si no está autenticado, redirige a login
  if ((vista === 'usuarios' || vista === 'examenes') && !usuario) {
    vista = 'login';
  }

  contenedorApp.innerHTML = '';

  if (vista === 'login') {
    contenedorApp.appendChild(document.createElement('acme-login'));
  } else if (vista === 'usuarios') {
    contenedorApp.appendChild(document.createElement('acme-usuarios'));
  } else if (vista === 'examenes') {
    contenedorApp.appendChild(document.createElement('acme-examenes-admin'));
  } else {
    contenedorApp.appendChild(document.createElement('acme-examen-publico'));
  }
}

window.addEventListener('cambiar-vista', e => {
  mostrarVista(e.detail);
});

// Vista inicial: Login si no hay sesión, o Gestión de Usuarios si ya inició sesión
mostrarVista(obtenerUsuarioActivo() ? 'usuarios' : 'login');
