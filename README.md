# Plataforma para Exámenes - Acme School

Aplicación web desarrollada en **HTML5**, **CSS3** y **JavaScript modular** utilizando **Web Components** nativos y persistencia de datos en formato **JSON** con `localStorage`.

## Credenciales y Datos Precargados

* **Usuario Administrador:** `admin@acmeschool.edu` | Contraseña: `admin123`
* **Usuario Docente:** `docente@acmeschool.edu` | Contraseña: `docente123`
* **Examen 1 (`JS-101` — Normal):** *Fundamentos de JavaScript (Examen Normal)* — 10 minutos, 4 preguntas, 60% de aprobación.
* **Examen 2 (`TEST-1M` — Reloj 1 Minuto):** *Prueba Rápida de Lógica (1 Minuto)* — 1 minuto, 3 preguntas, 70% de aprobación (para verificar que el reloj llega a `00:00` y finaliza automáticamente).
* **Examen 3 (`WEB-202` — Normal):** *Desarrollo Web: HTML5 y CSS3* — 8 minutos, 3 preguntas, 60% de aprobación.
* **Examen 4 (`BORR-04` — Para eliminar en demo):** *Examen de Ejemplo para Eliminar* — 5 minutos, 3 preguntas, 50% de aprobación.

## Módulos de la Plataforma

1. **Login (`js/login.js`):** Vista inicial de acceso para personal Administrativo y Docente mediante correo y contraseña.
2. **Gestión de Usuarios (`js/usuarios.js`):** Módulo privado con CRUD completo (`Número de identificación`, `Nombre completo`, `Email`, `Teléfono`, `Cargo` y `Contraseña`).
3. **Gestión de Exámenes (`js/examenesAdmin.js`):** Módulo privado con CRUD completo de exámenes (`Código`, `Título`, `Tiempo`, `Porcentaje de aprobación`, `Descripción`), preguntas y respuestas con selección única de respuesta correcta.
4. **Resolución de Exámenes (`js/examenPublico.js`):** Módulo público sin autenticación que lista los exámenes disponibles, solicita identificación y nombre completo del estudiante, ejecuta un reloj regresivo en tiempo real y muestra el porcentaje obtenido junto con el estado de aprobación.

## Estructura del Proyecto

```text
ProyectoAcmeschool_JavaScript_Rosas_Frank/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── app.js             # Enrutador y protección de rutas privadas
    ├── storage.js         # Persistencia JSON en localStorage y manejo de sesión
    ├── navbar.js          # Web Component <acme-navbar>
    ├── login.js           # Web Component <acme-login>
    ├── usuarios.js        # Web Component <acme-usuarios> (CRUD)
    ├── examenesAdmin.js   # Web Component <acme-examenes-admin> (CRUD)
    └── examenPublico.js   # Web Component <acme-examen-publico>
```

## Ejecución Local

1. Abre la carpeta en **Visual Studio Code**.
2. Ejecuta `index.html` con **Live Server**.
3. Abre **DevTools (F12) -> Application -> Local Storage** para visualizar `acme_school_datos_v2` en tiempo real.
