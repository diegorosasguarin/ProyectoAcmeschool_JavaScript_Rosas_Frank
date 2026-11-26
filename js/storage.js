/**
 * Persistencia de datos en JSON usando localStorage.
 * Datos de prueba precargados para la calificación en vivo:
 * 1. Usuario Admin: admin@acmeschool.edu / admin123 (y Docente: docente@acmeschool.edu / docente123)
 * 2. Examen 1 (Normal - 10 min, 4 preguntas): Fundamentos de JavaScript (JS-101)
 * 3. Examen 2 (Reloj 1 min, 3 preguntas): Prueba Rápida de Temporizador (TEST-1M)
 * 4. Examen 3 (Normal - 8 min, 3 preguntas): Desarrollo Web HTML5 y CSS3 (WEB-202)
 * 5. Examen 4 (Para eliminar en la demo sin afectar los anteriores): Examen Borrador de Prueba (DEL-00)
 */

const STORAGE_KEY = 'acme_school_datos_v2';
const SESSION_KEY = 'acme_school_sesion_v2';

const DATOS_INICIALES = {
  usuarios: [
    {
      id: 1,
      identificacion: '1098765432',
      nombre: 'Administrador Acme',
      email: 'admin@acmeschool.edu',
      telefono: '3001234567',
      cargo: 'Administrativo',
      password: 'admin123'
    },
    {
      id: 2,
      identificacion: '1095111222',
      nombre: 'Laura Gómez',
      email: 'docente@acmeschool.edu',
      telefono: '3109876543',
      cargo: 'Docente',
      password: 'docente123'
    }
  ],
  examenes: [
    {
      id: 101,
      codigo: 'JS-101',
      titulo: 'Fundamentos de JavaScript (Examen Normal)',
      tiempo: 10,
      porcentajeAprobacion: 60,
      descripcion: 'Examen general con 4 preguntas sobre variables, JSON, DOM y Web Components.',
      preguntas: [
        {
          id: 1,
          enunciado: '¿Qué palabra clave declara una variable con alcance de bloque cuyo valor puede reasignarse?',
          respuestas: [
            { id: 1, descripcion: 'const', esCorrecta: false },
            { id: 2, descripcion: 'let', esCorrecta: true },
            { id: 3, descripcion: 'static', esCorrecta: false }
          ]
        },
        {
          id: 2,
          enunciado: '¿Qué método convierte un objeto JavaScript a texto JSON para guardarlo en localStorage?',
          respuestas: [
            { id: 1, descripcion: 'JSON.stringify()', esCorrecta: true },
            { id: 2, descripcion: 'JSON.parse()', esCorrecta: false },
            { id: 3, descripcion: 'JSON.toText()', esCorrecta: false }
          ]
        },
        {
          id: 3,
          enunciado: '¿Qué método registra una etiqueta HTML personalizada como Web Component?',
          respuestas: [
            { id: 1, descripcion: 'document.addComponent()', esCorrecta: false },
            { id: 2, descripcion: 'customElements.define()', esCorrecta: true },
            { id: 3, descripcion: 'window.createTag()', esCorrecta: false }
          ]
        },
        {
          id: 4,
          enunciado: '¿Qué método de arreglo devuelve un nuevo arreglo con los elementos que cumplen una condición?',
          respuestas: [
            { id: 1, descripcion: 'filter()', esCorrecta: true },
            { id: 2, descripcion: 'push()', esCorrecta: false },
            { id: 3, descripcion: 'join()', esCorrecta: false }
          ]
        }
      ]
    },
    {
      id: 102,
      codigo: 'TEST-1M',
      titulo: 'Prueba Rápida de Lógica (1 Minuto)',
      tiempo: 1,
      porcentajeAprobacion: 70,
      descripcion: 'Examen de 1 minuto con 3 preguntas para comprobar que el reloj llega a 00:00 y termina solo.',
      preguntas: [
        {
          id: 1,
          enunciado: '¿Cuál es el resultado de 5 + "5" en JavaScript?',
          respuestas: [
            { id: 1, descripcion: '"55"', esCorrecta: true },
            { id: 2, descripcion: '10', esCorrecta: false },
            { id: 3, descripcion: 'NaN', esCorrecta: false }
          ]
        },
        {
          id: 2,
          enunciado: '¿Qué operador compara igualdad estricta (valor y tipo de dato)?',
          respuestas: [
            { id: 1, descripcion: '==', esCorrecta: false },
            { id: 2, descripcion: '===', esCorrecta: true },
            { id: 3, descripcion: '=', esCorrecta: false }
          ]
        },
        {
          id: 3,
          enunciado: '¿Qué función ejecuta código repetidamente cada cierto intervalo de milisegundos?',
          respuestas: [
            { id: 1, descripcion: 'setTimeout()', esCorrecta: false },
            { id: 2, descripcion: 'setInterval()', esCorrecta: true },
            { id: 3, descripcion: 'requestFrame()', esCorrecta: false }
          ]
        }
      ]
    },
    {
      id: 103,
      codigo: 'WEB-202',
      titulo: 'Desarrollo Web: HTML5 y CSS3',
      tiempo: 8,
      porcentajeAprobacion: 60,
      descripcion: 'Evaluación sobre etiquetas semánticas HTML5 y diseño responsive con CSS.',
      preguntas: [
        {
          id: 1,
          enunciado: '¿Qué etiqueta HTML5 define el contenido principal de un documento?',
          respuestas: [
            { id: 1, descripcion: '<main>', esCorrecta: true },
            { id: 2, descripcion: '<section>', esCorrecta: false },
            { id: 3, descripcion: '<aside>', esCorrecta: false }
          ]
        },
        {
          id: 2,
          enunciado: '¿Qué propiedad CSS permite crear cuadrículas bidimensionales de filas y columnas?',
          respuestas: [
            { id: 1, descripcion: 'display: block', esCorrecta: false },
            { id: 2, descripcion: 'display: grid', esCorrecta: true },
            { id: 3, descripcion: 'position: sticky', esCorrecta: false }
          ]
        },
        {
          id: 3,
          enunciado: '¿Qué regla CSS permite adaptar estilos según el ancho de pantalla en celulares?',
          respuestas: [
            { id: 1, descripcion: '@media', esCorrecta: true },
            { id: 2, descripcion: '@keyframes', esCorrecta: false },
            { id: 3, descripcion: '@import', esCorrecta: false }
          ]
        }
      ]
    },
    {
      id: 104,
      codigo: 'BORR-04',
      titulo: 'Examen de Ejemplo para Eliminar',
      tiempo: 5,
      porcentajeAprobacion: 50,
      descripcion: 'Examen adicional precargado para probar el botón Eliminar durante la demostración.',
      preguntas: [
        {
          id: 1,
          enunciado: '¿Cuánto es 2 + 2?',
          respuestas: [
            { id: 1, descripcion: '4', esCorrecta: true },
            { id: 2, descripcion: '5', esCorrecta: false }
          ]
        },
        {
          id: 2,
          enunciado: '¿De qué color es el cielo despejado?',
          respuestas: [
            { id: 1, descripcion: 'Azul', esCorrecta: true },
            { id: 2, descripcion: 'Verde', esCorrecta: false }
          ]
        },
        {
          id: 3,
          enunciado: '¿Cuántos días tiene una semana?',
          respuestas: [
            { id: 1, descripcion: '7 días', esCorrecta: true },
            { id: 2, descripcion: '10 días', esCorrecta: false }
          ]
        }
      ]
    }
  ],
  resultados: []
};

export function inicializarDatos() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATOS_INICIALES));
  }
}

export function obtenerDatos() {
  inicializarDatos();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

export function guardarDatos(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

export function iniciarSesion(email, password) {
  const datos = obtenerDatos();
  const usuario = datos.usuarios.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password.trim()
  );
  if (usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    return usuario;
  }
  return null;
}

export function obtenerUsuarioActivo() {
  const sesion = localStorage.getItem(SESSION_KEY);
  return sesion ? JSON.parse(sesion) : null;
}

export function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
}
