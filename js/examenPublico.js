/**
 * Web Component: <acme-examen-publico>
 * Módulo público (sin autenticación):
 * 1. Lista exámenes disponibles (Título, Tiempo para resolverlo, Porcentaje para aprobación).
 * 2. Pide número de identificación y nombre completo del estudiante.
 * 3. Muestra encabezado del examen (título, total preguntas, porcentaje para aprobar),
 *    reloj regresivo en tiempo real (desde minutos asignados hasta 0), preguntas enumeradas y botón Terminar.
 * 4. Calcula porcentaje de respuestas acertadas y mensaje de aprobación o no aprobación.
 */
import { obtenerDatos, guardarDatos } from './storage.js';

function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class AcmeExamenPublico extends HTMLElement {
  constructor() {
    super();
    this.paso = 'lista'; // 'lista' | 'datos' | 'examen' | 'resultado'
    this.examenActual = null;
    this.estudiante = { identificacion: '', nombre: '' };
    this.respuestasSeleccionadas = {};
    this.segundosRestantes = 0;
    this.temporizador = null;
    this.resultadoFinal = null;
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.detenerReloj();
  }

  detenerReloj() {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  formatearTiempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  }

  iniciarReloj() {
    this.detenerReloj();
    this.temporizador = setInterval(() => {
      this.segundosRestantes--;
      const relojEl = this.querySelector('#reloj-display');
      if (relojEl) {
        relojEl.textContent = this.formatearTiempo(Math.max(0, this.segundosRestantes));
        if (this.segundosRestantes <= 15) {
          relojEl.parentElement.classList.add('reloj-urgente');
        }
      }

      if (this.segundosRestantes <= 0) {
        this.detenerReloj();
        this.finalizarExamen(true);
      }
    }, 1000);
  }

  finalizarExamen(porTiempo = false) {
    this.detenerReloj();
    const totalPreguntas = this.examenActual.preguntas.length;
    let aciertos = 0;

    this.examenActual.preguntas.forEach(p => {
      const elegidaId = this.respuestasSeleccionadas[p.id];
      const correcta = p.respuestas.find(r => r.esCorrecta);
      if (correcta && elegidaId === correcta.id) {
        aciertos++;
      }
    });

    const porcentaje = totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 0;
    const aprobado = porcentaje >= this.examenActual.porcentajeAprobacion;

    this.resultadoFinal = {
      examenId: this.examenActual.id,
      examenTitulo: this.examenActual.titulo,
      identificacion: this.estudiante.identificacion,
      nombre: this.estudiante.nombre,
      aciertos,
      totalPreguntas,
      porcentaje,
      porcentajeRequerido: this.examenActual.porcentajeAprobacion,
      aprobado,
      finalizadoPorTiempo: porTiempo,
      fecha: new Date().toLocaleString()
    };

    const datos = obtenerDatos();
    datos.resultados.push(this.resultadoFinal);
    guardarDatos(datos);

    this.paso = 'resultado';
    this.render();
  }

  render() {
    if (this.paso === 'lista') {
      const datos = obtenerDatos();
      this.innerHTML = `
        <section>
          <h1 class="titulo-modulo">Exámenes Disponibles</h1>
          <p class="subtitulo">Módulo público: selecciona un examen para comenzar sin necesidad de iniciar sesión.</p>

          <div class="grid-examenes">
            ${datos.examenes.map(ex => `
              <article class="card card-examen">
                <div>
                  <span class="badge badge-azul" style="margin-bottom: 8px;">${escaparHTML(ex.codigo)}</span>
                  <h2 style="font-size: 1.2rem; margin-bottom: 8px;">${escaparHTML(ex.titulo)}</h2>
                  <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 14px;">${escaparHTML(ex.descripcion)}</p>
                </div>

                <div>
                  <p style="font-size: 0.92rem; margin-bottom: 4px;">
                    <strong>Tiempo para resolverlo:</strong> ${ex.tiempo} minuto(s)
                  </p>
                  <p style="font-size: 0.92rem; margin-bottom: 14px;">
                    <strong>Porcentaje para aprobación:</strong> ${ex.porcentajeAprobacion}%
                  </p>
                  <button class="btn btn-primario btn-elegir" data-id="${ex.id}" style="width: 100%;">
                    Presentar Examen
                  </button>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      `;

      this.querySelectorAll('.btn-elegir').forEach(btn => {
        btn.addEventListener('click', () => {
          const datos = obtenerDatos();
          this.examenActual = datos.examenes.find(ex => ex.id === Number(btn.dataset.id));
          this.paso = 'datos';
          this.render();
        });
      });
    }

    else if (this.paso === 'datos') {
      this.innerHTML = `
        <section class="card" style="max-width: 480px; margin: 20px auto;">
          <button type="button" id="btn-volver-lista" class="btn btn-gris btn-sm" style="margin-bottom: 12px;">
            &larr; Volver a exámenes
          </button>
          <h1 class="titulo-modulo">${escaparHTML(this.examenActual.titulo)}</h1>
          <p class="subtitulo">
            Tiempo: ${this.examenActual.tiempo} min | Aprobación: ${this.examenActual.porcentajeAprobacion}%
          </p>

          <form id="form-estudiante">
            <div class="campo">
              <label for="est-id">Número de identificación</label>
              <input type="text" id="est-id" placeholder="Ej. 1098123456" required />
            </div>

            <div class="campo">
              <label for="est-nombre">Nombre completo</label>
              <input type="text" id="est-nombre" placeholder="Ingresa tu nombre completo" required />
            </div>

            <button type="submit" class="btn btn-verde" style="width: 100%; margin-top: 8px;">
              Iniciar Examen
            </button>
          </form>
        </section>
      `;

      this.querySelector('#btn-volver-lista').addEventListener('click', () => {
        this.paso = 'lista';
        this.render();
      });

      this.querySelector('#form-estudiante').addEventListener('submit', e => {
        e.preventDefault();
        this.estudiante = {
          identificacion: this.querySelector('#est-id').value.trim(),
          nombre: this.querySelector('#est-nombre').value.trim()
        };
        this.respuestasSeleccionadas = {};
        this.segundosRestantes = this.examenActual.tiempo * 60;
        this.paso = 'examen';
        this.render();
        this.iniciarReloj();
      });
    }

    else if (this.paso === 'examen') {
      const ex = this.examenActual;
      this.innerHTML = `
        <section>
          <!-- Encabezado con título, total de preguntas, porcentaje para aprobar y reloj en tiempo real -->
          <div class="card header-examen-activo">
            <div>
              <h1 style="color: var(--azul); font-size: 1.35rem;">${escaparHTML(ex.titulo)}</h1>
              <p style="font-size: 0.9rem; color: var(--gris);">
                Estudiante: <strong>${escaparHTML(this.estudiante.nombre)}</strong> (ID: ${escaparHTML(this.estudiante.identificacion)})
              </p>
              <p style="font-size: 0.9rem; margin-top: 4px;">
                Total de preguntas: <strong>${ex.preguntas.length}</strong> |
                Porcentaje para aprobar: <strong>${ex.porcentajeAprobacion}%</strong>
              </p>
            </div>

            <div class="reloj-caja">
              <span style="font-size: 0.78rem; text-transform: uppercase;">Tiempo Restante</span>
              <span id="reloj-display" class="reloj-tiempo">${this.formatearTiempo(this.segundosRestantes)}</span>
            </div>
          </div>

          <!-- Preguntas enumeradas con selección única -->
          <form id="form-resolver">
            ${ex.preguntas.map((p, idx) => `
              <div class="card">
                <p style="font-weight: 700; margin-bottom: 12px;">
                  ${idx + 1}. ${escaparHTML(p.enunciado)}
                </p>

                ${p.respuestas.map(r => `
                  <label class="opcion-radio">
                    <input type="radio" name="preg_${p.id}" value="${r.id}" data-pid="${p.id}" />
                    <span>${escaparHTML(r.descripcion)}</span>
                  </label>
                `).join('')}
              </div>
            `).join('')}

            <button type="submit" class="btn btn-primario" style="padding: 12px 24px; font-size: 1rem;">
              Terminar
            </button>
          </form>
        </section>
      `;

      this.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', e => {
          const pId = Number(e.target.dataset.pid);
          this.respuestasSeleccionadas[pId] = Number(e.target.value);
        });
      });

      this.querySelector('#form-resolver').addEventListener('submit', e => {
        e.preventDefault();
        this.finalizarExamen(false);
      });
    }

    else if (this.paso === 'resultado') {
      const res = this.resultadoFinal;
      this.innerHTML = `
        <section class="card" style="max-width: 540px; margin: 25px auto; text-align: center;">
          <span class="badge ${res.aprobado ? 'badge-verde' : 'badge-rojo'}" style="font-size: 0.95rem; padding: 6px 16px;">
            ${res.aprobado ? 'EXAMEN APROBADO' : 'EXAMEN NO APROBADO'}
          </span>

          <h1 class="titulo-modulo" style="margin-top: 12px;">${escaparHTML(res.examenTitulo)}</h1>
          <p style="color: var(--gris); margin-bottom: 18px;">
            Estudiante: <strong>${escaparHTML(res.nombre)}</strong> (ID: ${escaparHTML(res.identificacion)})
          </p>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 18px;">
            <p style="font-size: 0.95rem;">Porcentaje de respuestas acertadas:</p>
            <p style="font-size: 2.3rem; font-weight: 800; color: ${res.aprobado ? 'var(--exito)' : 'var(--rojo)'};">
              ${res.porcentaje}%
            </p>
            <p style="font-size: 0.9rem; color: var(--gris);">
              Acertaste ${res.aciertos} de ${res.totalPreguntas} preguntas (Mínimo requerido: ${res.porcentajeRequerido}%)
            </p>
            <p style="font-size: 0.82rem; color: var(--gris); margin-top: 6px;">
              ${res.finalizadoPorTiempo ? 'Finalizado automáticamente al llegar el reloj a 0.' : 'Finalizado manualmente por el estudiante.'}
            </p>
          </div>

          <button type="button" id="btn-inicio-publico" class="btn btn-primario">
            Volver a Exámenes Disponibles
          </button>
        </section>
      `;

      this.querySelector('#btn-inicio-publico').addEventListener('click', () => {
        this.paso = 'lista';
        this.render();
      });
    }
  }
}

customElements.define('acme-examen-publico', AcmeExamenPublico);
