/**
 * Web Component: <acme-examenes-admin>
 * Módulo privado para crear, actualizar y eliminar exámenes junto con sus preguntas y respuestas.
 * Cada pregunta solo puede tener una respuesta marcada como correcta.
 */
import { obtenerDatos, guardarDatos, obtenerUsuarioActivo } from './storage.js';

function escaparAtributo(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class AcmeExamenesAdmin extends HTMLElement {
  constructor() {
    super();
    this.editandoId = null;
    this.preguntas = [];
  }

  connectedCallback() {
    if (!obtenerUsuarioActivo()) {
      window.dispatchEvent(new CustomEvent('cambiar-vista', { detail: 'login' }));
      return;
    }
    this.reiniciarFormulario();
    this.render();
  }

  reiniciarFormulario() {
    this.editandoId = null;
    this.preguntas = [this.crearPreguntaVacia()];
  }

  crearPreguntaVacia() {
    return {
      id: Date.now() + Math.random(),
      enunciado: '',
      respuestas: [
        { id: 1, descripcion: '', esCorrecta: true },
        { id: 2, descripcion: '', esCorrecta: false }
      ]
    };
  }

  sincronizarPreguntasDesdeVista() {
    const bloques = this.querySelectorAll('.bloque-pregunta');
    if (!bloques.length) return;

    this.preguntas = Array.from(bloques).map((bloque, idxP) => {
      const enunciado = bloque.querySelector('.input-enunciado').value;
      const filas = bloque.querySelectorAll('.fila-respuesta');
      const respuestas = Array.from(filas).map((fila, idxR) => ({
        id: idxR + 1,
        descripcion: fila.querySelector('.input-resp').value,
        esCorrecta: fila.querySelector('.radio-correcta').checked
      }));
      return { id: idxP + 1, enunciado, respuestas };
    });
  }

  leerCabeceraFormulario() {
    return {
      codigo: this.querySelector('#e-codigo')?.value || '',
      titulo: this.querySelector('#e-titulo')?.value || '',
      tiempo: this.querySelector('#e-tiempo')?.value || '10',
      porcentaje: this.querySelector('#e-porcentaje')?.value || '60',
      descripcion: this.querySelector('#e-descripcion')?.value || ''
    };
  }

  restaurarCabeceraFormulario(cab) {
    if (!cab) return;
    this.querySelector('#e-codigo').value = cab.codigo;
    this.querySelector('#e-titulo').value = cab.titulo;
    this.querySelector('#e-tiempo').value = cab.tiempo;
    this.querySelector('#e-porcentaje').value = cab.porcentaje;
    this.querySelector('#e-descripcion').value = cab.descripcion;
  }

  render() {
    const datos = obtenerDatos();

    this.innerHTML = `
      <section>
        <h1 class="titulo-modulo">Gestión de Exámenes</h1>
        <p class="subtitulo">Crea, actualiza y elimina evaluaciones, preguntas y respuestas correctas.</p>

        <div id="msg-examen" class="alerta" style="display: none;"></div>

        <!-- Tabla de exámenes registrados -->
        <div class="card">
          <h2 style="margin-bottom: 12px; font-size: 1.2rem;">Exámenes Registrados (${datos.examenes.length})</h2>
          <div class="tabla-responsive">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Tiempo</th>
                  <th>Aprobación</th>
                  <th>Preguntas</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${datos.examenes.map(ex => `
                  <tr>
                    <td><span class="badge badge-azul">${ex.codigo}</span></td>
                    <td><strong>${ex.titulo}</strong></td>
                    <td>${ex.tiempo} min</td>
                    <td>${ex.porcentajeAprobacion}%</td>
                    <td>${ex.preguntas.length}</td>
                    <td>${ex.descripcion}</td>
                    <td>
                      <div class="acciones-tabla">
                        <button class="btn btn-verde btn-sm btn-editar-ex" data-id="${ex.id}">Actualizar</button>
                        <button class="btn btn-rojo btn-sm btn-eliminar-ex" data-id="${ex.id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Formulario para creación y actualización -->
        <div class="card">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 12px;">
            <h2 style="font-size: 1.2rem;">${this.editandoId ? 'Actualizar Examen' : 'Crear Nuevo Examen'}</h2>
            ${this.editandoId ? `<button type="button" id="btn-cancelar-ex" class="btn btn-gris btn-sm">Cancelar Edición</button>` : ''}
          </div>

          <form id="form-examen">
            <div class="grid-form">
              <div class="campo">
                <label for="e-codigo">Código</label>
                <input type="text" id="e-codigo" placeholder="Ej. MAT-101" required />
              </div>

              <div class="campo">
                <label for="e-titulo">Título</label>
                <input type="text" id="e-titulo" placeholder="Ej. Lógica de Programación" required />
              </div>

              <div class="campo">
                <label for="e-tiempo">Tiempo (Minutos)</label>
                <input type="number" id="e-tiempo" min="1" value="10" required />
              </div>

              <div class="campo">
                <label for="e-porcentaje">Porcentaje de aprobación (%)</label>
                <input type="number" id="e-porcentaje" min="1" max="100" value="60" required />
              </div>
            </div>

            <div class="campo">
              <label for="e-descripcion">Descripción del examen</label>
              <textarea id="e-descripcion" rows="2" placeholder="Describe brevemente el examen..." required></textarea>
            </div>

            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin: 16px 0 10px;">
              <h3>Preguntas (${this.preguntas.length})</h3>
              <button type="button" id="btn-agregar-pregunta" class="btn btn-verde btn-sm">+ Agregar Pregunta</button>
            </div>

            ${this.preguntas.map((p, idxP) => `
              <div class="bloque-pregunta">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong>Pregunta #${idxP + 1}</strong>
                  ${this.preguntas.length > 1 ? `<button type="button" class="btn btn-rojo btn-sm btn-quitar-p" data-idx="${idxP}">Quitar</button>` : ''}
                </div>

                <div class="campo">
                  <input type="text" class="input-enunciado" placeholder="Escribe la pregunta..." value="${escaparAtributo(p.enunciado)}" required />
                </div>

                <p style="font-size: 0.85rem; color: #475569; margin-bottom: 6px;">
                  Respuestas (marca solo una como correcta):
                </p>

                ${p.respuestas.map((r, idxR) => `
                  <div class="fila-respuesta">
                    <input type="radio" class="radio-correcta" name="correcta_${idxP}" ${r.esCorrecta ? 'checked' : ''} title="Respuesta correcta" />
                    <input type="text" class="input-resp" placeholder="Descripción de respuesta ${idxR + 1}" value="${escaparAtributo(r.descripcion)}" required />
                    ${p.respuestas.length > 2 ? `<button type="button" class="btn btn-gris btn-sm btn-quitar-r" data-p="${idxP}" data-r="${idxR}">X</button>` : ''}
                  </div>
                `).join('')}

                <button type="button" class="btn btn-gris btn-sm btn-agregar-r" data-p="${idxP}" style="margin-top: 4px;">
                  + Agregar Respuesta
                </button>
              </div>
            `).join('')}

            <button type="submit" class="btn btn-primario" style="margin-top: 10px;">
              ${this.editandoId ? 'Actualizar Examen' : 'Guardar Examen'}
            </button>
          </form>
        </div>
      </section>
    `;

    this.vincularEventos();
  }

  vincularEventos() {
    this.querySelector('#form-examen').addEventListener('submit', e => this.guardarExamen(e));

    this.querySelector('#btn-cancelar-ex')?.addEventListener('click', () => {
      this.reiniciarFormulario();
      this.render();
    });

    this.querySelector('#btn-agregar-pregunta').addEventListener('click', () => {
      const cab = this.leerCabeceraFormulario();
      this.sincronizarPreguntasDesdeVista();
      this.preguntas.push(this.crearPreguntaVacia());
      this.render();
      this.restaurarCabeceraFormulario(cab);
    });

    this.querySelectorAll('.btn-quitar-p').forEach(btn => {
      btn.addEventListener('click', () => {
        const cab = this.leerCabeceraFormulario();
        this.sincronizarPreguntasDesdeVista();
        this.preguntas.splice(Number(btn.dataset.idx), 1);
        this.render();
        this.restaurarCabeceraFormulario(cab);
      });
    });

    this.querySelectorAll('.btn-agregar-r').forEach(btn => {
      btn.addEventListener('click', () => {
        const cab = this.leerCabeceraFormulario();
        this.sincronizarPreguntasDesdeVista();
        const pIdx = Number(btn.dataset.p);
        this.preguntas[pIdx].respuestas.push({ id: Date.now(), descripcion: '', esCorrecta: false });
        this.render();
        this.restaurarCabeceraFormulario(cab);
      });
    });

    this.querySelectorAll('.btn-quitar-r').forEach(btn => {
      btn.addEventListener('click', () => {
        const cab = this.leerCabeceraFormulario();
        this.sincronizarPreguntasDesdeVista();
        const pIdx = Number(btn.dataset.p);
        const rIdx = Number(btn.dataset.r);
        this.preguntas[pIdx].respuestas.splice(rIdx, 1);
        if (!this.preguntas[pIdx].respuestas.some(r => r.esCorrecta)) {
          this.preguntas[pIdx].respuestas[0].esCorrecta = true;
        }
        this.render();
        this.restaurarCabeceraFormulario(cab);
      });
    });

    this.querySelectorAll('.btn-editar-ex').forEach(btn => {
      btn.addEventListener('click', () => {
        const datos = obtenerDatos();
        const ex = datos.examenes.find(item => item.id === Number(btn.dataset.id));
        if (!ex) return;
        this.editandoId = ex.id;
        this.preguntas = JSON.parse(JSON.stringify(ex.preguntas));
        this.render();
        this.restaurarCabeceraFormulario({
          codigo: ex.codigo,
          titulo: ex.titulo,
          tiempo: ex.tiempo,
          porcentaje: ex.porcentajeAprobacion,
          descripcion: ex.descripcion
        });
      });
    });

    this.querySelectorAll('.btn-eliminar-ex').forEach(btn => {
      btn.addEventListener('click', () => {
        const datos = obtenerDatos();
        datos.examenes = datos.examenes.filter(item => item.id !== Number(btn.dataset.id));
        guardarDatos(datos);
        if (this.editandoId === Number(btn.dataset.id)) this.reiniciarFormulario();
        this.render();
        this.mostrarMensaje('Examen eliminado correctamente.');
      });
    });
  }

  mostrarMensaje(texto) {
    const el = this.querySelector('#msg-examen');
    if (!el) return;
    el.textContent = texto;
    el.className = 'alerta alerta-ok';
    el.style.display = 'block';
  }

  guardarExamen(e) {
    e.preventDefault();
    this.sincronizarPreguntasDesdeVista();

    const datos = obtenerDatos();
    const examen = {
      id: this.editandoId || Date.now(),
      codigo: this.querySelector('#e-codigo').value.trim().toUpperCase(),
      titulo: this.querySelector('#e-titulo').value.trim(),
      tiempo: Number(this.querySelector('#e-tiempo').value),
      porcentajeAprobacion: Number(this.querySelector('#e-porcentaje').value),
      descripcion: this.querySelector('#e-descripcion').value.trim(),
      preguntas: this.preguntas
    };

    if (this.editandoId) {
      datos.examenes = datos.examenes.map(ex => (ex.id === this.editandoId ? examen : ex));
    } else {
      datos.examenes.push(examen);
    }

    guardarDatos(datos);
    this.reiniciarFormulario();
    this.render();
    this.mostrarMensaje('Examen guardado correctamente en Local Storage.');
  }
}

customElements.define('acme-examenes-admin', AcmeExamenesAdmin);
