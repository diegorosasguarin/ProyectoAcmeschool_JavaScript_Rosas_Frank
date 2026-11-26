/**
 * Web Component: <acme-navbar>
 * Barra superior de navegación. Los módulos privados (Usuarios y Exámenes)
 * únicamente se muestran si el usuario está autenticado.
 */
import { obtenerUsuarioActivo, cerrarSesion } from './storage.js';

class AcmeNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const usuario = obtenerUsuarioActivo();

    this.innerHTML = `
      <header style="background: #1e3a8a; color: white; padding: 14px 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.12);">
        <div style="max-width: 1120px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <strong style="font-size: 1.25rem; cursor: pointer;" id="nav-logo">
            Acme School
          </strong>

          <nav style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            ${usuario ? `
              <button class="btn btn-gris btn-sm" data-vista="usuarios">
                Gestión de Usuarios
              </button>
              <button class="btn btn-gris btn-sm" data-vista="examenes">
                Gestión de Exámenes
              </button>
              <button class="btn btn-gris btn-sm" data-vista="publico">
                Zona Pública (Exámenes)
              </button>
              <span style="font-size: 0.85rem; margin: 0 6px;">
                ${usuario.nombre} (${usuario.cargo})
              </span>
              <button class="btn btn-rojo btn-sm" id="btn-salir">
                Cerrar Sesión
              </button>
            ` : `
              <button class="btn btn-gris btn-sm" data-vista="publico">
                Zona Pública (Exámenes)
              </button>
              <button class="btn btn-verde btn-sm" data-vista="login">
                Iniciar Sesión
              </button>
            `}
          </nav>
        </div>
      </header>
    `;

    this.querySelector('#nav-logo').addEventListener('click', () => {
      this.irA(obtenerUsuarioActivo() ? 'usuarios' : 'login');
    });

    this.querySelectorAll('[data-vista]').forEach(boton => {
      boton.addEventListener('click', () => this.irA(boton.dataset.vista));
    });

    const btnSalir = this.querySelector('#btn-salir');
    if (btnSalir) {
      btnSalir.addEventListener('click', () => {
        cerrarSesion();
        this.render();
        this.irA('publico');
      });
    }
  }

  irA(vista) {
    window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: vista }));
  }
}

customElements.define('acme-navbar', AcmeNavbar);
