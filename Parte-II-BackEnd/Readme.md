# TPI Parte II - Programación III (TUPaD)

//TO DO actualizar readme

## 📝 Descripción del Proyecto
Este proyecto consiste en el desarrollo del backend para un sistema de gestión de catálogo de productos y categorías, diseñado sobre una arquitectura persistente utilizando **JPA (Jakarta Persistence)** e **Hibernate** como proveedor.

El sistema implementa el patrón **Repository Genérico** para centralizar y abstraer por completo las operaciones CRUD elementales, desacoplando la lógica de negocio de los detalles de la base de datos embebida **H2**. Toda la interacción con el usuario se realiza a través de una interfaz interactiva por línea de comandos (Consola), controlando de manera segura el ciclo de vida del `EntityManager` en cada transacción.

### 🚀 Tecnologías Utilizadas
* **Java SE 21**
* **Jakarta Persistence API (JPA) 3.1**
* **Hibernate Core 6.x**
* **Base de Datos H2** (Modo embebido / archivo local)
* **Gradle** (Gestor de dependencias y automatización)

---

## 🏗️ Arquitectura y Patrones de Diseño
* **Generic Repository Pattern:** Uso de interfaces y clases abstractas con tipos genéricos (`<T extends Base>`) para unificar la persistencia de datos.
* **EntityManager-per-operation:** Cada método del repositorio gestiona la apertura de su propio contexto y garantiza su cierre inmediato en bloques `finally`, evitando fugas de conexiones (*connection leaks*).
* **Control Transaccional Seguro:** Manejo de excepciones con `rollback` explícito ante fallos de base de datos para mantener la integridad de los datos.
* **Uso de Optional:** Implementación de `Optional<T>` en las búsquedas por ID para encapsular la presencia o ausencia de registros de forma limpia y moderna.
* **Baja Lógica:** Cumplimiento de políticas de negocio donde ningún registro se elimina físicamente; se manipula el estado mediante una bandera `eliminado = true`.

---

## 🛠️ Requisitos Previos
Antes de ejecutar la aplicación, asegúrate de tener instalado:
* **Java Development Kit (JDK) 21** o superior.
* **Gradle** (opcional, incluido mediante el `gradlew` wrapper del proyecto).

---

## 🏃 Instrucciones de Ejecución

Sigue estos pasos para clonar, compilar y ejecutar el proyecto localmente:

### 1. Compilar el Proyecto
Abre una terminal en la ruta raíz del proyecto y ejecuta el siguiente comando para limpiar y compilar los recursos:
```bash
./gradlew build -x test