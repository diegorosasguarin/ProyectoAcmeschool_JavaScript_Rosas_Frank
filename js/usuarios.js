/**
 * Web Component: <acme-usuarios>
 * Módulo privado para crear, actualizar y eliminar usuarios (Administrativo / Docente).
 */
import { obtenerDatos, guardarDatos, obtenerUsuarioActivo } from './storage.js';

class AcmeUsuarios extends HTMLElement {
  constructor() {
    super();
    this.editandoId = null;
  }

  connectedCallback() {
    if (!obtenerUsuarioActivo()) {
      window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: 'login' }));
      return;
    }
    this.render();
  }

  render() {
    const datos = obtenerDatos();
    const usuarioEditar = this.editandoId
      ? datos.usuarios.find(u => u.id === this.editandoId)
      : null;

    this.innerHTML = `
      <section>
        <h1 class="titulo-modulo">Gestión de Usuarios</h1>
        <p class="subtitulo">Crea, actualiza o elimina los usuarios que acceden a los módulos privados.</p>

        <!-- Formulario para creación y actualización -->
        <div class="card">
          <h2 style="margin-bottom: 12px; font-size: 1.2rem;">
            ${usuarioEditar ? 'Actualizar Usuario' : 'Registrar Nuevo Usuario'}
          </h2>

          <div id="msg-usuario" class="alerta" style="display: none;"></div>

          <form id="form-usuario">
            <div class="grid-form">
              <div class="campo">
                <label for="u-identificacion">Número de identificación</label>
                <input type="text" id="u-identificacion" value="${usuarioEditar ? usuarioEditar.identificacion : ''}" required />
              </div>

              <div class="campo">
                <label for="u-nombre">Nombre completo</label>
                <input type="text" id="u-nombre" value="${usuarioEditar ? usuarioEditar.nombre : ''}" required />
              </div>

              <div class="campo">
                <label for="u-email">Email</label>
                <input type="email" id="u-email" value="${usuarioEditar ? usuarioEditar.email : ''}" required />
              </div>

              <div class="campo">
                <label for="u-telefono">Teléfono</label>
                <input type="text" id="u-telefono" value="${usuarioEditar ? usuarioEditar.telefono : ''}" required />
              </div>

              <div class="campo">
                <label for="u-cargo">Cargo</label>
                <select id="u-cargo" required>
                  <option value="Administrativo" ${usuarioEditar?.cargo === 'Administrativo' ? 'selected' : ''}>Administrativo</option>
                  <option value="Docente" ${usuarioEditar?.cargo === 'Docente' ? 'selected' : ''}>Docente</option>
                </select>
              </div>

              <div class="campo">
                <label for="u-password">Contraseña</label>
                <input type="password" id="u-password" value="${usuarioEditar ? usuarioEditar.password : ''}" required />
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <button type="submit" class="btn btn-primario">
                ${usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
              ${usuarioEditar ? `<button type="button" id="btn-cancelar-u" class="btn btn-gris">Cancelar</button>` : ''}
            </div>
          </form>
        </div>

        <!-- Tabla de usuarios registrados -->
        <div class="card">
          <h2 style="margin-bottom: 12px; font-size: 1.2rem;">Usuarios Registrados (${datos.usuarios.length})</h2>
          <div class="tabla-responsive">
            <table>
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Cargo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${datos.usuarios.map(u => `
                  <tr>
                    <td>${u.identificacion}</td>
                    <td><strong>${u.nombre}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.telefono}</td>
                    <td><span class="badge badge-azul">${u.cargo}</span></td>
                    <td>
                      <div class="acciones-tabla">
                        <button class="btn btn-verde btn-sm btn-editar" data-id="${u.id}">Actualizar</button>
                        <button class="btn btn-rojo btn-sm btn-eliminar" data-id="${u.id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    this.querySelector('#form-usuario').addEventListener('submit', e => this.guardarUsuario(e));

    this.querySelector('#btn-cancelar-u')?.addEventListener('click', () => {
      this.editandoId = null;
      this.render();
    });

    this.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editandoId = Number(btn.dataset.id);
        this.render();
      });
    });

    this.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', () => this.eliminarUsuario(Number(btn.dataset.id)));
    });
  }

  mostrarMensaje(texto, tipo = 'ok') {
    const el = this.querySelector('#msg-usuario');
    if (!el) return;
    el.textContent = texto;
    el.className = `alerta ${tipo === 'error' ? 'alerta-error' : 'alerta-ok'}`;
    el.style.display = 'block';
  }

  guardarUsuario(e) {
    e.preventDefault();
    const datos = obtenerDatos();
    const identificacion = this.querySelector('#u-identificacion').value.trim();
    const nombre = this.querySelector('#u-nombre').value.trim();
    const email = this.querySelector('#u-email').value.trim();
    const telefono = this.querySelector('#u-telefono').value.trim();
    const cargo = this.querySelector('#u-cargo').value;
    const password = this.querySelector('#u-password').value.trim();

    const correoRepetido = datos.usuarios.some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.id !== this.editandoId
    );
    if (correoRepetido) {
      this.mostrarMensaje('Ya existe un usuario con ese correo electrónico.', 'error');
      return;
    }

    const nuevo = {
      id: this.editandoId || Date.now(),
      identificacion,
      nombre,
      email,
      telefono,
      cargo,
      password
    };

    if (this.editandoId) {
      datos.usuarios = datos.usuarios.map(u => (u.id === this.editandoId ? nuevo : u));
    } else {
      datos.usuarios.push(nuevo);
    }

    guardarDatos(datos);
    this.editandoId = null;
    this.render();
    this.mostrarMensaje('Usuario guardado correctamente en Local Storage.', 'ok');
  }

  eliminarUsuario(id) {
    const activo = obtenerUsuarioActivo();
    if (activo && activo.id === id) {
      this.mostrarMensaje('No puedes eliminar el usuario con el que tienes sesión abierta.', 'error');
      return;
    }
    const datos = obtenerDatos();
    datos.usuarios = datos.usuarios.filter(u => u.id !== id);
    guardarDatos(datos);
    if (this.editandoId === id) this.editandoId = null;
    this.render();
    this.mostrarMensaje('Usuario eliminado correctamente.', 'ok');
  }
}

customElements.define('acme-usuarios', AcmeUsuarios);
