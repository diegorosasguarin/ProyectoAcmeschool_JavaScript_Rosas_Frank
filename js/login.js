/**
 * Web Component: <acme-login>
 * Vista inicial de la aplicación para iniciar sesión con correo y contraseña.
 */
import { iniciarSesion } from './storage.js';

class AcmeLogin extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="card" style="max-width: 440px; margin: 28px auto;">
        <h1 class="titulo-modulo">Iniciar Sesión</h1>
        <p class="subtitulo">Acceso para personal Administrativo y Docente de Acme School.</p>

        <div id="login-error" class="alerta alerta-error" style="display: none;"></div>

        <form id="form-login">
          <div class="campo">
            <label for="login-email">Correo electrónico</label>
            <input type="email" id="login-email" placeholder="admin@acmeschool.edu" required />
          </div>

          <div class="campo">
            <label for="login-pass">Contraseña</label>
            <input type="password" id="login-pass" placeholder="Ingresa tu contraseña" required />
          </div>

          <button type="submit" class="btn btn-primario" style="width: 100%; margin-top: 8px;">
            Ingresar
          </button>
        </form>

        <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 0.85rem; color: #475569;">
          <p><strong>Credenciales de prueba precargadas:</strong></p>
          <p>Admin: <code>admin@acmeschool.edu</code> / Clave: <code>admin123</code></p>
          <p>Docente: <code>docente@acmeschool.edu</code> / Clave: <code>docente123</code></p>
        </div>

        <div style="margin-top: 14px; text-align: center;">
          <button type="button" id="btn-ir-publico" class="btn btn-gris" style="width: 100%;">
            Ir a Zona Pública de Exámenes (Sin Login)
          </button>
        </div>
      </section>
    `;

    this.querySelector('#form-login').addEventListener('submit', e => {
      e.preventDefault();
      const email = this.querySelector('#login-email').value;
      const password = this.querySelector('#login-pass').value;
      const usuario = iniciarSesion(email, password);

      if (!usuario) {
        const alerta = this.querySelector('#login-error');
        alerta.textContent = 'Correo electrónico o contraseña incorrectos.';
        alerta.style.display = 'block';
        return;
      }

      document.getElementById('navbar').render();
      window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: 'usuarios' }));
    });

    this.querySelector('#btn-ir-publico').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: 'publico' }));
    });
  }
}

customElements.define('acme-login', AcmeLogin);
