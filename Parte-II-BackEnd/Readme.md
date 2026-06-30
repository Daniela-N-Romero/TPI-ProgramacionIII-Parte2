# TPI PROGRAMACIÓN III
## Sistema de Gestión de Pedidos - TPI JPA/Hibernate (Parte 2)

### Datos de la alumna
* **Nombre:** Daniela Nahir Romero
* **Carrera:** Tecnicatura Universitaria en Programación (TUPaD)
* **DNI:** N° 38.440.237
* **Comisión:** N° 15

---
Este proyecto consiste en una aplicación de consola robusta desarrollada en Java utilizando **JPA (Java Persistence API)** e **Hibernate** como proveedor de persistencia para gestionar el ciclo de vida de un sistema de comercio electrónico (Categorías, Productos, Usuarios, Pedidos y Reportes Financieros).

---

## Estructura del Proyecto

El proyecto sigue una arquitectura organizada en capas bien definidas (Entidades, Repositorios, Servicios/Menús):

```text
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── tp/
│   │           └── jpa/
│   │               ├── Main.java                 # Punto de entrada y gestión de menús por consola
│   │               ├── model/
│   │               │   └── entities/             # Capa de modelo (Entidades mapeadas con JPA)
│   │               │       ├── Categoria.java
│   │               │       ├── Producto.java
│   │               │       ├── Usuario.java
│   │               │       ├── Pedido.java
│   │               │       ├── DetallePedido.java
│   │               │       └── EstadoPedido.java # Enum (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO)
│   │               ├── repository/               # Capa de acceso a datos (Patrón Repository)
│   │               │   ├── BaseRepository.java
│   │               │   ├── BaseRepositoryImpl.java
│   │               │   ├── CategoriaRepository.java
│   │               │   ├── ProductoRepository.java
│   │               │   ├── UsuarioRepository.java
│   │               │   └── PedidoRepository.java
│   │               └── util/
│   │                   └── JPAUtil.java          # Configuración y obtención del EntityManagerFactory
│   └── resources/
│       └── META-INF/
│           └── persistence.xml                  # Archivo de configuración JPA/Hibernate


```
---

## Requisitos e Instalación

### Requisitos Previos: 
- Java JDK 17 o superior.
- Gradle o Maven como gestor de dependencias.
- Motor de Base de Datos MySQL (o compatible). 

### Pasos para la Configuración

#### Configurar la Base de Datos:

- Crea un esquema vacío en tu motor de base de datos con el nombre tpi_jpa (o el nombre que prefieras).
- Configurar el archivo persistence.xml: Asegúrate de ajustar los datos de conexión (usuario y contraseña de tu motor SQL) en el archivo src/main/resources/META-INF/persistence.xml.

### Compilar y Ejecutar:

Si utilizas Gradle, ejecuta el proyecto desde la terminal o tu IDE favorito corriendo el archivo Main. 

---

## Diseño y Mapeo JPA



### Relaciones del Dominio


- **Categoría - Producto (One-to-Many)**: Una categoría conoce múltiples productos. El borrado lógico de una categoría no elimina físicamente sus productos. 


- **Pedido - DetallePedido (One-to-Many)**: Un pedido posee un listado de detalles que representan el carrito de compras. Se aplica cascada total (ALL) y eliminación de huérfanos (orphanRemoval = true), ya que un DetallePedido no tiene sentido de existir sin su Pedido contenedor.  


- **Usuario - Pedido (Relación Unidireccional One-to-Many)**: El Usuario tiene una colección de pedidos: @OneToMany List<Pedido> pedidos.


- **El Pedido NO conoce al Usuario (no posee un atributo Usuario usuario)**. Esto simplifica el acoplamiento pero requiere de técnicas avanzadas de consulta (JPQL) para obtener al cliente dueño de una orden.


### Transacciones y el ciclo de vida de EntityManager


El corazón de la consistencia transaccional del sistema reside en el correcto manejo de la sesión JPA mediante EntityManager.

- Alta de Pedido Atómica (HU-16)

Para asegurar que un pedido se registre de manera correcta sin inconsistencias (como quedarse sin stock a mitad de la carga o que se registre un pago sin decrementar la base de datos), se implementó un proceso Atómico controlado por transacciones explícitas:

-  Se valida el stock temporal de cada producto solicitado.
- Se inicia una transacción activa: em.getTransaction().begin().
- Se resta de forma definitiva el stock en la base de datos para cada producto del pedido.
- Se persiste la orden de compra en cascada.
- Si ocurre cualquier error, falta de stock de último momento o excepción inesperada, se ejecuta un Rollback inmediato (em.getTransaction().rollback()) devolviendo la base de datos a su estado original intacto.

---
## Tecnologías Utilizadas



Lenguaje: Java 17

Framework ORM: JPA 2.2 / Hibernate Core 6.x

Base de Datos: MySQL Connector/J

Motor de persistencia: JDBC integrado a través de JPA