# Proyecto: Protección de Rutas (Educativo)

## ✍️ Descripción

Este es un proyecto de demostración creado con fines educativos para ilustrar un mecanismo básico de protección de rutas en el lado del cliente (frontend) utilizando **Vite** y **TypeScript**.

El objetivo es mostrar cómo se puede restringir el acceso a ciertas páginas según el rol de un usuario (por ejemplo, `ADMIN` o `CLIENT`).

---

## 🔑 Credenciales de Prueba 
El sistema puede ser recorrido de diferente manera según el rol del usuario. Si se navega sin logearse puede accederse a la pantalla de inicio, la tienda principal, al login y al registro. En cambio, si se hace un logueo el rol del usuario determinara las páginas que serán visibles. 
El mapa de rutas permitidas para cada tipo de usuario se encuentra en el arvivo `guards.ts`.

Para comenzar con las pruebas se pueden utilizar los usuarios que se traen del JSON original. 

- Usuario Administrador:    admin@admin.com / admin123
- Usuario común:            cliente@food.com / cliente123

Por otro lado, el registro de usuarios genera usuarios comunes. En esta etapa de desarrollo no se incluye la posibilidad de crear más usuarios administradores.

## ⚠️ ¡Importante! Nivel de Seguridad

La protección de rutas implementada en este proyecto **NO ES SEGURA** y no debe utilizarse en un entorno de producción.

- **Razón**: La lógica de autenticación se basa en datos guardados en `localStorage` en el navegador del usuario.
- **Riesgo**: Cualquier usuario con conocimientos técnicos básicos puede abrir las herramientas de desarrollador del navegador para inspeccionar, modificar o eliminar los datos de `localStorage`, obteniendo así acceso no autorizado a rutas protegidas.

Este enfoque es útil únicamente para fines de aprendizaje y para prototipos de bajo riesgo. La seguridad real debe implementarse en el **backend**.

---

## 🚀 Instalación y Uso

Se recomienda usar `pnpm` como gestor de paquetes para mayor eficiencia en el manejo de dependencias.

### 1. Instalar pnpm

Si no tienes `pnpm` instalado, puedes hacerlo fácilmente a través de `npm` (que viene con Node.js) ejecutando el siguiente comando en tu terminal:

```bash
npm install -g pnpm
```

### 2. Instalar Dependencias del Proyecto

Una vez en la carpeta raíz del proyecto, instala las dependencias necesarias con `pnpm`:

```bash
pnpm install
```

### 3. Ejecutar el Proyecto

Para iniciar el servidor de desarrollo de Vite, ejecuta:

```bash
pnpm dev
```

La aplicación estará disponible en la URL que aparezca en la terminal (generalmente `http://localhost:5173`).

---

## ⚙️ ¿Cómo Funciona la Protección de Rutas?

El mecanismo es simple y se gestiona desde el código TypeScript en la carpeta `src/utils`:

1.  **Inicio de Sesión**: Cuando un usuario se "loguea", su información (incluido su rol) se guarda como un string JSON en `localStorage`.
2.  **Carga de Página Protegida**: Cada vez que se intenta cargar una página protegida (ej. la página de Administrador), se ejecuta la verificación... //TO DO explicar como. 
3.  **Verificación**: El script comprueba:
    - Si existe un usuario en `localStorage`. Si no, redirige al login.
    - Si el rol del usuario guardado coincide con el rol requerido para acceder a esa página. Si no coincide, lo redirige a una página de acceso denegado o a su "home" correspondiente.
4.  **Cierre de Sesión (Logout)**: Al cerrar sesión, la información del usuario se elimina de `localStorage`.

---

## 📁 Estructura del Proyecto


//TO DO : actualizar
```
/
├── src/
│   ├── pages/                # Contiene las páginas de la aplicación
│   │   ├── admin/            # Páginas solo para administradores
│   │   ├── auth/             # Páginas de autenticación (login, registro)
│   │   └── client/           # Páginas solo para clientes
│   ├── types/                # Define las interfaces y tipos (IUser, Rol)
│   └── utils/                # Lógica reutilizable
│       ├── auth.ts           # Función principal de verificación de rol y sesión
│       ├── localStorage.ts   # Funciones para leer/escribir en localStorage
│       └── navigate.ts       # Función para redirigir al usuario
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

## 💾 Gestión de Persistencia y Datos Híbridos (Frontend Autónomo)

Para cumplir estrictamente con los requerimientos de la cátedra, el sistema implementa una capa de persistencia simulada e independiente mediante almacenamiento web (`localStorage` y `sessionStorage`). El frontend es 100% autónomo y consume archivos `.json` locales usando la API `fetch`, quedando preparado para que en una iteración posterior estos métodos sean reemplazados por llamadas a una API REST real.

### 🔄 Arquitectura de Almacenamiento Dinámico

No todos los datos se comportan de la misma manera en la aplicación. Por lo tanto, se diseñó un interceptor centralizado en `storageBase.ts` que deriva dinámicamente el destino de la persistencia según la clave de acceso (*Storage Key*):

1. **Persistencia Transitoria (`sessionStorage` / "En Memoria"):**
   - **Entidades:** Catálogo de productos (`products`), categorías (`categories`), listado global de usuarios (`users`) y el panel de administración de pedidos del Admin (`orders`).
   - **Comportamiento:** Se mantiene la integridad de los datos (altas, bajas lógicas y modificaciones) al navegar entre los diferentes archivos físicos `.html` del entorno multipágina de **Vite**. Sin embargo, **al presionar F5 o recargar la pestaña, los cambios se destruyen**, forzando al sistema a re-importar los JSON limpios originales (cumpliendo con la consigna de *modificaciones en memoria*).

2. **Persistencia Estricta (`localStorage`):**
   - **Entidades:** Sesión activa del usuario (`userData`), carritos de compra (`cart_{email}`) e historial de confirmaciones de los clientes (`orders_{email}`).
   - **Comportamiento:** Los datos se guardan permanentemente en el disco local del navegador del usuario. Sobreviven a cierres de sesión o recargas completas (F5), garantizando que el historial del cliente no se borre.

---

### ⏳ Inicialización Automática Bajo Demanda (Lazy Loading)

Para resolver el problema de los múltiples puntos de entrada en entornos de desarrollo multi-página con Vite, se eliminó el proceso de carga masiva en el `main.ts`. En su lugar, el archivo `storageBase.ts` maneja la inicialización de forma asíncrona y perezosa:

- Cada vez que una sección requiere datos (ej. al listar la tienda), se invoca `getElementsFromStorage`.
- Esta función evalúa en tiempo de ejecución si la clave correspondiente ya tiene información en su respectivo storage.
- Si está vacía (por ser el primer ingreso o tras pulsar F5), interrumpe el flujo un microsegundo, gatilla de manera automática e interna la función asíncrona de `fetch()` hacia el archivo `.json`, impacta el resultado en el almacenamiento correspondiente y renderiza la vista. Si ya existían datos, omite el fetch para no consumir recursos innecesarios.

---

### 🔀 Flujo Unificado en Pedidos (Admin vs. Cliente)

Un desafío clave de la consigna fue conectar el pedido persistente del cliente con la gestión transitoria del Administrador. Se solucionó mediante la función `registrarNuevoPedidoDelCliente`:
- Cuando un cliente realiza el *checkout*, el sistema registra el objeto pedido en su historial persistente (`orders_{email}` en `localStorage`).
- Simultáneamente, clona dicho objeto y lo inyecta en el array general de órdenes (`orders` en `sessionStorage`) para que el Administrador pueda verlo e interactuar en tiempo real (cambiar su estado, aplicar filtros) desde su panel de control durante el tiempo de vida de la sesión.

### Pedidos

Cada pedido tiene un valor de envio de $500 que se suma al total de la compra. 