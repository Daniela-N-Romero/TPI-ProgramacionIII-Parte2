package com.tp.jpa;

import com.tp.jpa.model.entities.Categoria;
import com.tp.jpa.model.entities.Producto;
import com.tp.jpa.model.entities.Usuario;
import com.tp.jpa.model.entities.Pedido;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.model.enums.FormaPago;

import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static EntityManager em;
    private static CategoriaRepository categoriaRepo;
    private static ProductoRepository productoRepo;
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] eloquence) {

        EntityManagerFactory emf = JPAUtil.getEntityManagerFactory();
        em = emf.createEntityManager();

        // Inicialización de los repositorios de la capa de datos
        categoriaRepo = new CategoriaRepository(emf);
        productoRepo = new ProductoRepository(emf);

        // Llamamos a la función para verificar y cargar datos iniciales
        cargarDatosSiEstaVacia();

        int opcion;

        do {
            System.out.println("\n=========================================");
            System.out.println("       MENÚ PRINCIPAL - PARCIAL 2        ");
            System.out.println("=========================================");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Seleccione una opción: ");

            try {
                opcion = Integer.parseInt(scanner.nextLine());
                switch (opcion) {
                    case 1: menuCategorias(); break;
                    case 2: menuProductos(); break;
                    case 3: menuUsuarios(); break;
                    case 4: menuPedidos(); break;
                    case 5: menuReportes(); break;
                    case 0: System.out.println("\n-- Adios --"); break;
                    default: System.out.println("\n-- Opción inválida. --\n"); break;
                }
            } catch (NumberFormatException e) {
                System.out.println("\nError: Por favor, ingrese un número válido.");
                opcion = -1;
            }
        } while (opcion != 0);

        if (em != null && em.isOpen()) {
            em.close();
        }

        // REQUISITO EXPLÍCITO: Cerramos el factory global al finalizar la app
        JPAUtil.close();
    }

    // =========================================================================
    // ABM CATEGORÍAS
    // =========================================================================
    private static void menuCategorias() {
        int opcion;
        do {
            System.out.println("\n--- GESTIÓN DE CATEGORÍAS ---");
            System.out.println("1. Crear Categoría");
            System.out.println("2. Modificar Categoría");
            System.out.println("3. Baja Lógica de Categoría");
            System.out.println("4. Listar Categorías Activas");
            System.out.println("0. Volver al Menú Principal");
            System.out.print("Seleccione una opción: ");

            try {
                opcion = Integer.parseInt(scanner.nextLine());
                switch (opcion) {
                    case 1: //CREAR CATEGORIA
                        System.out.print("Ingrese el nombre de la categoría: ");
                        String nombre = scanner.nextLine().trim();

                        if (nombre.isEmpty()) {
                            System.out.println("El nombre de la categoría no puede estar vacío. Operación cancelada.");
                            break;
                        }

                        System.out.print("Ingrese la descripción: (presione ENTER para omitir)");
                        String desc = scanner.nextLine().trim();

                        Categoria nuevaCategoria = Categoria.builder().nombre(nombre).descripcion(desc).build();
                        try {
                                Categoria categoriaGuardada = categoriaRepo.guardar(nuevaCategoria);
                                System.out.println("\nCategoría '" + categoriaGuardada.getNombre() + "' creada con éxito (ID: " + categoriaGuardada.getId() + ").");
                        } catch (Exception e) {
                                System.out.println("No se pudo guardar la categoría: " + e.getMessage());
                        }
                        break;


                    case 2: // MODIFICAR CATEGORÍA
                        System.out.print("Ingrese el ID de la categoría a modificar: ");
                        Long idCatMod = Long.parseLong(scanner.nextLine());

                        categoriaRepo.buscarPorId(idCatMod).ifPresentOrElse(
                                categoria -> {
                                    System.out.println("Categoría encontrada: " + categoria.getNombre());
                                    System.out.print("Nuevo nombre (actual: '" + categoria.getNombre() + "', ENTER para mantener): ");
                                    String entradaNombre = scanner.nextLine();
                                    if (!entradaNombre.trim().isEmpty()) {
                                        categoria.setNombre(entradaNombre);
                                    }

                                    System.out.print("Nueva descripción (actual: '" + categoria.getDescripcion() + "', ENTER para mantener): ");
                                    String entradaDesc = scanner.nextLine();
                                    if (!entradaDesc.trim().isEmpty()) {
                                        categoria.setDescripcion(entradaDesc);
                                    }

                                    categoriaRepo.guardar(categoria);
                                    System.out.println("Categoría actualizada correctamente.");
                                },
                                () -> System.out.println("El ID ingresado no corresponde a una categoría activa.")
                        );
                        break;
                    case 3: // BAJA LÓGICA DE CATEGORÍA
                        System.out.print("Ingrese el ID de la categoría a dar de baja: ");
                        Long idCatBaja = Long.parseLong(scanner.nextLine());

                        // 1. Primero la buscamos para verificar si existe y capturar su nombre
                        categoriaRepo.buscarPorId(idCatBaja).ifPresentOrElse(
                                categoria -> {
                                    String nombreAfectado = categoria.getNombre();
                                    boolean exito = categoriaRepo.eliminarLogico(idCatBaja);

                                    if (exito) {
                                        System.out.println("\nLa categoría '" + nombreAfectado + "' fue dada de baja correctamente.");
                                    } else {
                                        System.out.println("\nNo se pudo procesar la baja de la categoría.");
                                    }
                                },
                                () -> {
                                    System.out.println("\nEl ID ingresado no existe o ya corresponde a una categoría dada de baja.");
                                }
                        );
                        break;

                    case 4: //LISTAR CATEGORIAS
                        List<Categoria> activas = categoriaRepo.listarActivos();
                        if (activas.isEmpty()) {
                            System.out.println("\nNo hay categorías activas registradas.");
                        } else {
                            System.out.println("\nListado de Categorías Activas:");
                            for (Categoria cat : activas) {
                                System.out.println("ID: " + cat.getId() + " | Nombre: " + cat.getNombre() + " | Descripción: " + cat.getDescripcion());
                            }
                        }
                        break;


                    case 0: break;
                    default: System.out.println("\nOpción inválida.");
                }
            } catch (NumberFormatException e) {
                System.out.println("\nIngrese un número válido.");
                opcion = -1;
            }
        } while (opcion != 0);
    }

    // =========================================================================
    // ABM PRODUCTOS
    // =========================================================================
    private static void menuProductos() {
        int opcion;
        do {
            System.out.println("\n--- GESTIÓN DE PRODUCTOS ---");
            System.out.println("1. Crear Producto");
            System.out.println("2. Modificar Producto");
            System.out.println("3. Baja Lógica de Producto");
            System.out.println("4. Listar Productos Activos");
            System.out.println("0. Volver al Menú Principal");
            System.out.print("Seleccione una opción: ");

            try {
                opcion = Integer.parseInt(scanner.nextLine());
                switch (opcion) {
                    case 1: // CREAR
                        List<Categoria> categoriasActivas = categoriaRepo.listarActivos();
                        if (categoriasActivas.isEmpty()) {
                            System.out.println("No hay categorías activas en el sistema. Debe crear una categoría primero. Operación cancelada.");
                            break;
                        }

                        System.out.println("Categorías disponibles para asociar:");
                        categoriasActivas.forEach(cat ->
                                System.out.println("  [" + cat.getId() + "] " + cat.getNombre())
                        );

                        System.out.print("ID de Categoría a asociar: ");
                        Long catId;
                        try {
                            catId = Long.parseLong(scanner.nextLine());
                        } catch (NumberFormatException e) {
                            System.out.println("Error: El ID de categoría debe ser un número entero. Operación cancelada.");
                            break;
                        }

                        Optional<Categoria> catOptional = categoriaRepo.buscarPorId(catId);
                        if (catOptional.isEmpty()) {
                            System.out.println("Error: La categoría seleccionada no existe o está inactiva. Operación cancelada.");
                            break;
                        }
                        Categoria categoriaSeleccionada = catOptional.get();

                        System.out.print("\nNombre del producto: ");
                        String prodNombre = scanner.nextLine().trim();

                        while (prodNombre.isEmpty()) {
                            System.out.println("Error: El nombre no puede estar vacío. Vuelva a intentarlo.");
                            System.out.print("\nNombre del producto: ");
                            prodNombre = scanner.nextLine().trim();
                        }

                        System.out.print("Descripción: (opcional)");
                        String prodDesc = scanner.nextLine().trim();

                        System.out.print("Precio: ");
                        double precio;
                        try {
                            precio = Double.parseDouble(scanner.nextLine());
                        } catch (NumberFormatException e) {
                            System.out.println("Error: El precio debe ser un número válido. No se persiste.");
                            break;
                        }
                        if (precio <= 0) { // REQUISITO: Mayor a 0
                            System.out.println("Error: El precio debe ser mayor a 0. No se persiste.");
                            break;
                        }

                        System.out.print("Stock inicial: ");
                        int stock;
                        try {
                            stock = Integer.parseInt(scanner.nextLine());
                        } catch (NumberFormatException e) {
                            System.out.println("Error: El stock debe ser un número entero válido. No se persiste.");
                            break;
                        }
                        if (stock < 0) { // REQUISITO: Mayor o igual a 0
                            System.out.println("Error: El stock no puede ser negativo. No se persiste.");
                            break;
                        }

                        System.out.print("¿El producto está disponible? S/N (valor por defecto: Si)");
                        String respuesta = scanner.nextLine().trim();
                        Boolean disponible = true;
                        if (respuesta.equalsIgnoreCase("N")) {
                            disponible = false;
                        }

                        System.out.print("Nombre de archivo de imagen: (opcional)");
                        String imagen = scanner.nextLine().trim();

                            Producto nuevoProd = Producto.builder()
                                    .nombre(prodNombre)
                                    .descripcion(prodDesc)
                                    .precio(precio)
                                    .stock(stock)
                                    .imagen(imagen.isEmpty() ? null : imagen)
                                    .disponible(disponible)
                                    .build();
                            try {
                                // Guardamos el producto y obtenemos la copia persistida con su ID
                                Producto productoGuardado = productoRepo.guardar(nuevoProd);
                                categoriaSeleccionada.getProductos().add(productoGuardado);
                                categoriaRepo.guardar(categoriaSeleccionada);

                                System.out.println("\nProducto creado con éxito:");
                                System.out.println("  ID Generado: " + productoGuardado.getId());
                                System.out.println("  Categoria Asignada: " + categoriaSeleccionada.getNombre());


                            } catch (Exception e) {
                                System.out.println("Ocurrió un error al guardar el producto: " + e.getMessage());
                            }

                        break;

                    case 2: // MODIFICAR

                        System.out.println("\nProductos activos:\n");
                        productoRepo.listarActivos();

                        System.out.println("Ingrese el ID del producto a modificar: ");
                        Long idMod = Long.parseLong(scanner.nextLine());
                        productoRepo.buscarPorId(idMod).ifPresentOrElse(

                        producto -> {
                            // --- Bloque SI EXISTE ---
                            System.out.println("Producto encontrado: " + producto.getNombre());
                            System.out.print("Ingrese nuevo nombre (o presione Enter para mantener '" + producto.getNombre() + "'): ");
                            String nuevoNombre = scanner.nextLine();
                            if (!nuevoNombre.trim().isEmpty()) {
                                producto.setNombre(nuevoNombre);
                            }

                            // --- VALIDACIÓN PARA EL NOMBRE ---
                            System.out.print("Nuevo nombre (actual: '" + producto.getNombre() + "', presione ENTER para mantener): ");
                            String entradaNombre = scanner.nextLine();
                            if (!entradaNombre.trim().isEmpty()) {
                                producto.setNombre(entradaNombre);
                            }

                            // --- VALIDACIÓN PARA EL PRECIO ---
                            System.out.print("Nuevo precio (actual: " + producto.getPrecio() + ", presione ENTER para mantener): ");
                            String entradaPrecio = scanner.nextLine();
                            if (!entradaPrecio.trim().isEmpty()) {
                                producto.setPrecio(Double.parseDouble(entradaPrecio));
                            }

                            // --- VALIDACIÓN PARA EL STOCK ---
                            System.out.print("Nuevo stock (actual: " + producto.getStock() + ", presione ENTER para mantener): ");
                            String entradaStock = scanner.nextLine();
                            if (!entradaStock.trim().isEmpty()) {
                                int nuevoStock = Integer.parseInt(entradaStock);
                                producto.setStock(nuevoStock);
                                producto.setDisponible(nuevoStock > 0);
                            }

                            // Guardamos los cambios
                            productoRepo.guardar(producto);
                            System.out.println("[ÉXITO] Producto actualizado correctamente.");
                            },
                                () -> {
                                    // --- Bloque NO EXISTE ---
                                    System.out.println("El ID ingresado no corresponde a un producto activo. Saliendo...");
                                }
                        );
                        break;

                    case 3: // BAJA LÓGICA
                        System.out.print("Ingrese el ID del producto a dar de baja: ");
                        Long idProdBaja = Long.parseLong(scanner.nextLine());

                        // Buscamos antes del borrado lógico para validar existencia y capturar el nombre
                        productoRepo.buscarPorId(idProdBaja).ifPresentOrElse(
                                producto -> {
                                    // Guardamos el nombre antes de ejecutar la baja
                                    String nombreProductoAfectado = producto.getNombre();
                                    boolean exito = productoRepo.eliminarLogico(idProdBaja);

                                    if (exito) {
                                        System.out.println("\nEl producto '" + nombreProductoAfectado + "' fue dado de baja correctamente.");
                                    } else {
                                        System.out.println("\nNo se pudo procesar la baja del producto.");
                                    }
                                },
                                () -> {
                                    System.out.println("\nEl ID ingresado no existe o ya corresponde a un producto dado de baja. Saliendo...");
                                }
                        );
                        break;

                    case 4: // LISTAR
                        List<Producto> prods = productoRepo.listarActivos();
                        if (prods.isEmpty()) {
                            System.out.println("\nNo hay productos activos en el catálogo.");
                        } else {
                            System.out.println("\nListado de Productos Activos:");
                            for (Producto p : prods) {
                                boolean pDisponibilidad = p.isDisponible();
                                String disponibilidadProd = pDisponibilidad ? "SI" : "NO";

                                System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " - $" + p.getPrecio() + " (Stock: " + p.getStock() + " - ¿disponible?: " + disponibilidadProd + ")");
                            }
                        }
                        break;


                    case 0: break;
                    default: System.out.println("\nOpción inválida.");
                }
            } catch (Exception e) {
                System.out.println("\nOcurrió un error al procesar la operación: " + e.getMessage());
                opcion = -1;
            }
        } while (opcion != 0);
    }

    // =========================================================================
    // CONSULTA JPQL CON PARÁMETRO NOMBRADO
    // =========================================================================
    private static void consultarProductosPorCategoria() {
        System.out.println("\n---  LISTAR PRODUCTOS DE UNA CATEGORÍA ---");

        // Listar las categorías para que el operador seleccione una
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorías activas para consultar.");
            return;
        }

        System.out.println("Categorías disponibles:");
        for (Categoria cat : categorias) {
            System.out.println("  [" + cat.getId() + "] " + cat.getNombre());
        }

        try {
            System.out.print("Seleccione el ID de la categoría: ");
            Long catId = Long.parseLong(scanner.nextLine());

            // Validamos que la categoría elegida exista antes de buscar productos
            Categoria seleccionada = categoriaRepo.buscarPorId(catId).orElse(null);
            if (seleccionada == null) {
                System.out.println("\nLa categoría seleccionada no es válida o está inactiva.");
                return;
            }

            // Invocacamos al ProductoRepository que usa JPQL, TypedQuery y filtrado activo
            List<Producto> productosFiltrados = categoriaRepo.buscarProductosPorCategoria(catId);

            // Si la categoría no tiene productos activos, se informa explícitamente
            if (productosFiltrados.isEmpty()) {
                System.out.println("\nLa categoría '" + seleccionada.getNombre() + "' no tiene productos activos en el catálogo.");
            } else {
                System.out.println("\nProductos activos de la categoría '" + seleccionada.getNombre() + "':");
                //Mostrar ID, nombre, precio y stock de cada uno
                for (Producto p : productosFiltrados) {
                    System.out.println("  -> ID: " + p.getId() + " | " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock());
                }
            }
        } catch (NumberFormatException e) {
            System.out.println("\nError: Debe ingresar un ID numérico válido.");
        }
    }

    private static void cargarDatosSiEstaVacia() {
        // Verificamos si ya existen categorías en la base de datos
        Long cantidadCategorias = em.createQuery("SELECT COUNT(c) FROM Categoria c", Long.class).getSingleResult();

        if (cantidadCategorias == 0) {
            System.out.println("\n--- BASE DE DATOS VACÍA: PERSISTIENDO DATOS INICIALES ---");
            try {
                em.getTransaction().begin();

                // 1. Crear Categorías
                Categoria catElectro = Categoria.builder().nombre("Electrónica").descripcion("Dispositivos tecnológicos").build();
                Categoria catHogar = Categoria.builder().nombre("Hogar").descripcion("Artículos para la casa").build();
                Categoria catIndumentaria = Categoria.builder().nombre("Indumentaria").descripcion("Ropa y accesorios").build();

                em.persist(catElectro);
                em.persist(catHogar);
                em.persist(catIndumentaria);

                // Crear Productos y asociándolos a su categoría correspondiente
                Producto p1 = Producto.builder().nombre("Smart TV 55 pulgadas").descripcion("Televisor").precio(450000.0).stock(3).imagen("tv.png").disponible(true).build();
                Producto p2 = Producto.builder().nombre("Teléfono Celular Android").descripcion("Celular").precio(320000.0).stock(25).imagen("celular.png").disponible(true).build();
                Producto p3 = Producto.builder().nombre("Auriculares Bluetooth Inalámbricos").descripcion("Auriculares").precio(4500.0).stock(50).imagen("auris.png").disponible(true).build();
                Producto p4 = Producto.builder().nombre("Notebook de estudio 8GB RAM").descripcion("Notebook").precio(680000.0).stock(8).imagen("laptop.png").disponible(true).build();


                Producto p5 = Producto.builder().nombre("Lámpara de pie LED moderna").descripcion("Lámpara").precio(25000.0).stock(12).imagen("lampara.png").disponible(true).build();
                Producto p6 = Producto.builder().nombre("Juego de sábanas King Size").descripcion("Sábanas").precio(35000.0).stock(20).imagen("sabanas.png").disponible(true).build();
                Producto p7 = Producto.builder().nombre("Cafetera Espresso Express").descripcion("Cafetera").precio(120000.0).stock(5).imagen("cafetera.png").disponible(true).build();


                Producto p8 = Producto.builder().nombre("Zapatillas deportivas talle 41").descripcion("Zapatillas").precio(85000.0).stock(2).imagen("zapas.png").disponible(true).build();
                Producto p9 = Producto.builder().nombre("Campera de abrigo impermeable").descripcion("Campera").precio(95000.0).stock(10).imagen("campera.png").disponible(true).build();
                Producto p10 = Producto.builder().nombre("Remera de algodón lisa").descripcion("Remera").precio(15000.0).stock(40).imagen("remera.png").disponible(true).build();

                // Persistimos los productos
                em.persist(p1); em.persist(p2); em.persist(p3); em.persist(p4); em.persist(p5);
                em.persist(p6); em.persist(p7); em.persist(p8); em.persist(p9); em.persist(p10);

                catElectro.getProductos().add(p1);
                catElectro.getProductos().add(p2);
                catElectro.getProductos().add(p3);
                catElectro.getProductos().add(p4);
                catHogar.getProductos().add(p5);
                catHogar.getProductos().add(p6);
                catHogar.getProductos().add(p7);
                catIndumentaria.getProductos().add(p8);
                catIndumentaria.getProductos().add(p9);
                catIndumentaria.getProductos().add(p10);

                // Instanciamos Usuarios
                Usuario u1 = Usuario.builder().nombre("Daniela").apellido("Romero").mail("daniela@mail.com").contrasenia("pass123").rol(Rol.ADMIN).build();
                Usuario u2 = Usuario.builder().nombre("Jorge").apellido("Romero").mail("jorge@mail.com").contrasenia("jorge456").rol(Rol.USUARIO).build();

                // Instanciamos Pedidos

                Pedido ped1 = Pedido.builder().fecha(java.time.LocalDate.of(2026, 5, 15)).estado(Estado.PENDIENTE).formaPago(FormaPago.TARJETA).build();
                ped1.addDetallePedido(1, p4);
                ped1.addDetallePedido(2, p3);
                ped1.calcularTotal();
                u1.getPedidos().add(ped1);

                em.persist(ped1);
                em.persist(u1);
                em.persist(u2);


                em.getTransaction().commit();
                System.out.println("--- Datos iniciales cargados con éxito ---");

            } catch (Exception e) {
                if (em.getTransaction().isActive()) {
                    em.getTransaction().rollback();
                }
                System.out.println("Error: No se pudieron cargar los datos iniciales: " + e.getMessage());
            }
        } else {
            System.out.println("\n--- La base de datos ya contiene información. Se omitió la carga inicial. ---");
        }
    }

}


