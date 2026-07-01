# TPI PROGRAMACIÓN III
## 🍕 Food Store - Sistema de Gestión de Pedidos de Comida

### 🎓 Datos de la alumna
* **Nombre:** Daniela Nahir Romero
* **Carrera:** Tecnicatura Universitaria en Programación (TUPaD)
* **DNI:** N° 38.440.237
* **Comisión:** N° 15

---

## ✍️ Descripción del Proyecto
Este proyecto es una aplicación web multipágina orientada al comercio gastronómico, desarrollada de manera modular utilizando **Vite** y **TypeScript** en el Frontend, utilizando Local y Session Storage para persistencia de datos. 

El sistema divide los privilegios de navegación de forma estricta mediante roles (`ADMIN` y `USUARIO`), además de proveer una experiencia fluida de consulta interactiva para usuarios no registrados bajo un esquema de sesión abierta de lectura.

*VIDEO EXPLICATIVO:* https://youtu.be/Sn36F2VcxaE 

---

### Estructura del Proyecto
```
|   .gitignore
|   index.html            #Página de inicio
|   package-lock.json
|   package.json
|   pnpm-lock.yaml
|   README.md
|   tsconfig.json
|   vite.config.ts       #Detalle de rutas html con Vite
|   
+---public
|   |   favicon.svg
|   |   icons.svg
|   |   vite.svg
|   |   
|   \---data
|           categorias.json
|           pedidos.json
|           productos.json
|           usuarios.json
|           
\---src
    |   main.ts
    |   style.css
    |   vite-env.d.ts
    |   
    +---assets
    |       hero.png
    |       typescript.svg
    |       vite.svg
    |       
    +---pages
    |   +---admin
    |   |   +---adminHome        
    |   |   |       home.html
    |   |   |       home.ts
    |   |   |       
    |   |   +---categories              #Gestión de categorias
    |   |   |       categorias.ts
    |   |   |       categories.html
    |   |   |       
    |   |   +---orders                  #Gestión de Pedidos
    |   |   |       manageOrders.html
    |   |   |       manageOrders.ts
    |   |   |       
    |   |   \---products                #Gestión de Productos
    |   |           products.html
    |   |           products.ts
    |   |           
    |   +---auth                        #Autenticación
    |   |   +---login
    |   |   |       login.html
    |   |   |       login.ts
    |   |   |       
    |   |   \---registro
    |   |           registro.html
    |   |           registro.ts
    |   |           
    |   +---client    #Vista exclusiva de usuario logueado: mis pedidos
    |   |   \---orders
    |   |           clientOrders.html
    |   |           clientOrders.ts
    |   |           
    |   \---store
    |       +---cart                         #Carrito de compras
    |       |       cart.html  
    |       |       cart.ts
    |       |       
    |       +---home                         #Tienda
    |       |       storeHome.html
    |       |       storeHome.ts
    |       |       
    |       \---productDetail                #Detalle de productos
    |               productDetail.html
    |               productDetail.ts
    |               
    +---types           #Types para seguridad de datos con Typescript
    |       ICart.ts
    |       ICategory.ts
    |       IOrder.ts
    |       IProduct.ts
    |       IUser.ts
    |       
    \---utils                          #Lógica de fetch
        |   fetch.ts
        |   layout.ts
        |   
        +---auth                       #Lógica de autenticación
        |       auth.ts
        |       
        +---guards                     #Lógica de redireccionamiento y
        |       guards.ts              #acceso restringido
        |
        |       
        +---modals                     #Modales y alerts personalizados
        |       alert.ts
        |       modal.ts
        |       
        +---orders                     #Funciones útiles para pedidos
        |       orders.ts
        |       
        \---storage                   #Funciones que manejan el storage
                cartStorage.ts
                categoryStorage.ts
                orderStorage.ts
                productStorage.ts
                storageBase.ts        #Archivo base de manejo de storage
                userStorage.ts
```

---

## 🔑 Credenciales de Prueba 

### 👤 Perfil Cliente
* **Email:** `cliente@food.com`
* **Password:** `cliente123`

### 👑 Perfil Administrador
* **Email:** `admin@admin.com`
* **Password:** `admin123`

## 🔑 Ciclo de vida del Usuario 

El sistema implementa el uso de localStorage por motivos pedagógicos para persistir y destruir la sesión del usuario conectado:

- *Inicio de Sesión (loggedIn = true)*: Al autenticarse con éxito, se genera un objeto de estado en el localStorage bajo la clave userData. Este objeto no solo almacena el perfil del usuario (aunque omite intencionalmente su contraseña), sino que incorpora la bandera explícita loggedIn: true. Esta bandera es consultada por los sistemas de protección de rutas antes de renderizar cualquier vista sensible. Mediante tambien al acceso del mail del usuario alohado en este objeto, se puede renderizar los pedidos y carrito del usuario logueado. 

- *Cierre de Sesión (Destrucción Segura)*: Al presionar el botón de Cierre de Sesión administrado por el layout, el sistema ejecuta la remoción completa de la clave userData del localStorage (haciendo un borrado limpio), redirigiendo de inmediato al visitante a la pantalla de Login y bloqueando cualquier intento de navegación hacia atrás en el historial.

---

## 🛠️ Instalación y Configuración del Entorno

La aplicación utiliza `pnpm` como gestor de paquetes para optimizar tiempos de instalación y eficiencia de dependencias en el entorno local.

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install -g pnpm
pnpm install
pnpm run dev
```

---

## 🎯 Características y Requisitos del Sistema

La solución cubre de extremo a extremo los flujos principales del módulo Frontend del Trabajo Práctico Integrador:

- **Autenticación Adaptativa**: Formulario de inicio de sesión con enrutamiento inteligente basado en roles.

- **Uso Asincronía y Fetch**: Todas las cargas iniciales de datos se realizan mediante peticiones asíncronas (async/await) utilizando la API fetch nativa apuntando a los archivos estáticos de datos (/data/productos.json, /data/categorias.json, /data/pedidos.json y /data/usuarios.json). No existen datos duros (hardcodeados) en las vistas.

- **Catálogo de Productos Dinámico**: Renderizado asíncrono con filtros combinados por categorías, búsquedas en tiempo real por texto y ordenamientos múltiples (A-Z, Z-A, Precios).

- **Módulo de Carrito Autónomo**: Reglas de validación en tiempo real que restringen la agregación según el stock disponible remanente del producto, cálculo exacto de subtotales por fila y desgloses de costos del pedido.

- **Historial de Compras de Clientes**: Listado unificado con badges visuales de estado y modales detallados de transacciones previas.

- **Panel Administrativo Global (Dashboard)**: Visualización general de métricas financieras, administración interactiva con cambio de estados de pedidos en tiempo real mediante menús selectores y CRUDs en memoria de productos y categorías.
---

## 🚀 Optimizaciones de Arquitectura y "Toques Especiales" (Valor Agregado)

Más allá de los lineamientos mínimos solicitados por la cátedra, se diseñó e implementó una infraestructura robusta orientada a **emular el comportamiento de una arquitectura escalable** de nivel empresarial:

1. **Refactorización Integral de Capas de Almacenamiento (storageBase.ts)**: 

   Se migró la lógica de lectura y escritura a un motor genérico y reutilizable basado en Tipos Avanzados de TypeScript, al cual se denomino 'storageBase'. Esta abstracción centraliza las operaciones de persistencia, autoincrementa IDs y unifica la lógica de altas, bajas lógicas y modificaciones sin duplicar código en los distintos módulos (productStorage, categoryStorage, orderStorage).

2. **Tratamiento Híbrido Estricto (localStorage vs. sessionStorage)**
   Para cumplir la consigna pedagógica (no modificar los archivos JSON, persistir cambios en memoria, y guardar datos en LocalStorage) sin perder coherencia entre múltiples archivos .html, se dividió la persistencia:
   
   - _localStorage (Persistencia Estricta)_: Guarda de manera inmutable el usuario activo (userData), los carritos de compra (cart_{email}) y el histórico de órdenes completadas del cliente (orders_{email}). Soporta recargas duras (F5) sin pérdida de datos.
   
   - _sessionStorage (Persistencia Volátil/Transitoria)_: Almacena el catálogo de productos modificados, categorías y el panel global del Admin. Permite alterar los datos dinámicamente entre vistas de Vite, pero se destruye y limpia al cerrar la pestaña o recargar el sitio para re-importar los JSON limpios originales de la cátedra.

3. **Seguridad Perimetral: Guards y Mapa de Rutas de Acceso**

      Se implementó una capa defensiva modular (guards.ts) conectada a un mapa de rutas estricto. *Cada vista .html ejecuta un validador en su inicialización que intercepta el acceso indebido*: si un usuario estándar intenta forzar la URL hacia el panel /admin/, o si un administrador intenta acceder al flujo de checkout del carrito, el guard bloquea la carga del DOM y redirige inmediatamente al usuario a su Home correspondiente.

4. **Modo Invitado (Recorrido Abierto de Tienda)**

      Se diseñó un flujo de experiencia de usuario flexible donde los visitantes no autenticados pueden ingresar a la tienda, visualizar los productos y filtrar por categorías. Sin embargo, al momento de intentar presionar el botón "🛒 Agregar al Carrito", el sistema detiene la propagación del evento, resguarda el flujo y redirige al usuario a la vista de login de forma automática.

5. **Utilización del Método Centralizado obtenerEstadoCliente**
   
   Para evitar lecturas redundantes al storage y prevenir inconsistencias, se centralizó el estado de la sesión en la función obtenerEstadoCliente(). Este ayudante computa en tiempo real tres banderas booleanas clave a lo largo de toda la aplicación: isInvitado, isUsuario y isAdmin, simplificando las condicionales lógicas de renderizado y las validaciones de botones.

6. **Centralización de Layout Dinámico mediante layout.ts**

      Se eliminó la duplicación masiva de código HTML estructural implementando un inyector dinámico en layout.ts. Este script lee el estado del usuario activo y dibuja de forma automatizada tanto el Header principal como la Sidebar lateral, mutando visualmente los enlaces de navegación accesibles, actualizando el indicador numérico del carrito (badge) y manejando la destrucción de la sesión de manera segura.

7. **Inicialización Asíncrona "Bajo Demanda": Fetch Semilla**

   Para resolver el desfase de carga que provoca el entorno multipágina de Vite, se desarrolló la función de verificación asíncrona verificarFetchSemilla dentro del ciclo del storage base. En lugar de forzar cargas masivas pesadas en el archivo raíz main.ts, el sistema evalúa dinámicamente si el almacenamiento carece de información en el instante preciso en que una vista solicita los datos. De estar vacío, gatilla de forma perezosa e interna el fetch() hacia el archivo .json correspondiente, siembra el storage local y renderiza la pantalla de forma transparente sin interrumpir la UX.

8. **Motor de Modales y Alertas Personalizadas (ModalService y AlertService)**

      Se sustituyeron los diálogos nativos y bloqueantes del navegador (alert()) por un servicio unificado de alertas modales estéticas y enriquecidas con estilos CSS adaptados a la paleta de colores del proyecto, mejorando radicalmente la cohesión visual en flujos críticos como faltas de stock, confirmaciones de vaciado de carrito y redirecciones exitosas.

---

## ⚙️ Enrutamiento Personalizado y Compilación Multipágina (`vite.config.ts`)

Dado que Vite está diseñado de forma nativa para aplicaciones de una sola página (SPA), el desarrollo de un sistema con múltiples archivos `.html` independientes distribuidos en subcarpetas requería una intervención en el ciclo de vida del empaquetador. Se crearon dos optimizaciones avanzadas en la configuración:


1. **Estrategia Multi-Input de Rollup (`rollupOptions.input`):** Se configuró explícitamente un mapa de resolución de rutas dinámicas mediante `resolve(__dirname, ...)` para instruir al compilador Rollup sobre la existencia y ubicación exacta de cada una de las 11 vistas físicas del sistema (Módulos de Auth, Clientes, Tienda y Administración). Esto garantiza que el proceso de *Build* (`pnpm run build`) genere un empaquetado de producción sin omitir ninguna vista o asset asociado.

2. **Servidor Middleware con Reescritura de Rutas de Lectura Limpia (`html-rewriter-plugin`):**
   Para evitar el uso de extensiones `.html` explícitas o rutas físicas extensas en la barra de direcciones que degradaran la experiencia de usuario (UX), se desarrolló un **plugin personalizado para el servidor de desarrollo**. 
   Este intercepta los métodos de solicitud (`req.url`) en la capa de middleware de Connect y reescribe de forma interna la dirección hacia el recurso físico correspondiente sin provocar redirecciones HTTP de cara al cliente. Esto habilita un mapa de **URLs Amigables (*Pretty URLs*)** unificado para todo el ciclo de navegación. Algunos ejemplos de esto son:
   * `/login` ➡️ `/src/pages/auth/login/login.html`
   * `/tienda` ➡️ `/src/pages/store/home/storeHome.html`
   * `/carrito` ➡️ `/src/pages/store/cart/cart.html`
   * `/pedidos` ➡️ `/src/pages/client/orders/clientOrders.html`
   * `/adminPanel` ➡️ `/src/pages/admin/adminHome/home.html`
   
   Tambien se incluyo soporte de parámetros variables dinámicos por query string mediante expresiones de coincidencia: `/producto?id=X`.