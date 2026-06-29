package com.tp.jpa;

import com.tp.jpa.model.entities.Categoria;
import com.tp.jpa.model.entities.Producto;
import com.tp.jpa.model.entities.Usuario;
import com.tp.jpa.model.entities.Pedido;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.model.enums.FormaPago;

import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static EntityManager em;
    private static CategoriaRepository categoriaRepo;
    private static ProductoRepository productoRepo;
    private static UsuarioRepository usuarioRepo;
    private static PedidoRepository pedidoRepo;
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] eloquence) {

        EntityManagerFactory emf = JPAUtil.getEntityManagerFactory();
        em = emf.createEntityManager();

        // Inicialización de los repositorios de la capa de datos
        categoriaRepo = new CategoriaRepository(emf);
        productoRepo = new ProductoRepository(emf);
        usuarioRepo = new UsuarioRepository(emf);
        pedidoRepo = new PedidoRepository(emf);

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
    // ABM USUARIOS
    // =========================================================================

    private static void menuUsuarios() {
        int opcion;
        do {
            System.out.println("\n--- SUBMENÚ USUARIOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("5. Buscar usuarrio por mail");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");
            try {
                opcion = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                opcion = -1;
            }

            switch (opcion) {
                case 1: // ALTA
                    System.out.print("Nombre (obligatorio): ");
                    String nom = scanner.nextLine().trim();
                    if (nom.isEmpty()) { System.out.println("Error: El nombre es obligatorio."); break; }

                    System.out.print("Apellido (obligatorio): ");
                    String ape = scanner.nextLine().trim();
                    if (ape.isEmpty()) { System.out.println("Error: El apellido es obligatorio."); break; }

                    System.out.print("Mail (obligatorio y único): ");
                    String mail = scanner.nextLine().trim();
                    if (mail.isEmpty()) { System.out.println("Error: El mail es obligatorio."); break; }
                    if (usuarioRepo.buscarPorMail(mail).isPresent()) {
                        System.out.println("Error: El mail ya se encuentra registrado por otro usuario. No se persiste.");
                        break;
                    }

                    System.out.print("Celular: (opcional)");
                    String cel = scanner.nextLine().trim();

                    System.out.print("Contraseña (obligatorio): ");
                    String pass = scanner.nextLine().trim();
                    if (pass.isEmpty()) { System.out.println("Error: La contraseña es obligatoria."); break; }

                    System.out.print("Rol (ADMIN / USUARIO): ");
                    String rolStr = scanner.nextLine().trim().toUpperCase();
                    Rol rolSelected;
                    try {
                        rolSelected = Rol.valueOf(rolStr);
                    } catch (IllegalArgumentException e) {
                        System.out.println("Rol inválido. Se asignará USUARIO por defecto.");
                        rolSelected = Rol.USUARIO;
                    }

                    Usuario nuevoUsuario = Usuario.builder()
                            .nombre(nom).apellido(ape).mail(mail)
                            .celular(cel).contrasenia(pass).rol(rolSelected)
                            .build();

                    try {
                        Usuario guardado = usuarioRepo.guardar(nuevoUsuario);
                        System.out.println("¡Usuario registrado con éxito! ID Generado: " + guardado.getId());
                    } catch (Exception e) {
                        System.out.println("Error al guardar: " + e.getMessage());
                    }
                    break;

                case 2: // MODIFICAR
                    List<Usuario> activos = usuarioRepo.listarActivos();
                    if (activos.isEmpty()) { System.out.println("No hay usuarios activos."); break; }
                    activos.forEach(u -> System.out.println("  [" + u.getId() + "] " + u.getNombre() + " " + u.getApellido() + " (" + u.getMail() + ")"));

                    System.out.print("Seleccione el ID del usuario a modificar: ");
                    try {
                        Long idMod = Long.parseLong(scanner.nextLine());
                        Optional<Usuario> optU = usuarioRepo.buscarPorId(idMod);
                        if (optU.isEmpty()) { System.out.println("Error: Usuario no válido o dado de baja."); break; }
                        Usuario u = optU.get();

                        System.out.println("Valores actuales: " + u.getNombre() + " " + u.getApellido() + " | Cel: " + u.getCelular());

                        System.out.print("Nuevo Nombre (dejar vacío para conservar): ");
                        String nNom = scanner.nextLine().trim();
                        if (!nNom.isEmpty()) u.setNombre(nNom);

                        System.out.print("Nuevo Apellido (dejar vacío para conservar): ");
                        String nApe = scanner.nextLine().trim();
                        if (!nApe.isEmpty()) u.setApellido(nApe);

                        System.out.print("Nuevo Mail (dejar vacío para conservar): ");
                        String nMail = scanner.nextLine().trim();
                        if (!nMail.isEmpty()) {
                            // Buscamos si el mail ya existe en el sistema
                            Optional<Usuario> usuarioConMismoMail = usuarioRepo.buscarPorMail(nMail);

                            // Si existe Y el ID es diferente al del usuario actual, es un error
                            if (usuarioConMismoMail.isPresent() && !usuarioConMismoMail.get().getId().equals(u.getId())) {
                                System.out.println("Error: El mail '" + nMail + "' ya está siendo utilizado por otro usuario. No se guardan los cambios.");
                                break; // Cancela la modificación completa de este usuario
                            }
                            u.setMail(nMail);
                        }

                        System.out.print("Nuevo Celular (dejar vacío para conservar): ");
                        String nCel = scanner.nextLine().trim();
                        if (!nCel.isEmpty()) u.setCelular(nCel);

                        usuarioRepo.guardar(u);
                        System.out.println("¡Usuario modificado con éxito!");

                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case 3: // BAJA LÓGICA
                    System.out.print("Ingrese ID del usuario para dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(scanner.nextLine());
                        Optional<Usuario> optU = usuarioRepo.buscarPorId(idBaja);
                        if (optU.isEmpty()) { System.out.println("Error: El usuario no existe o ya está de baja."); break; }
                        String nombreAfectado = optU.get().getNombre() + " " + optU.get().getApellido();

                        if (usuarioRepo.eliminarLogico(idBaja)) {
                            System.out.println("Baja confirmada para el usuario: " + nombreAfectado);
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case 4: // LISTADO
                    List<Usuario> lista = usuarioRepo.listarActivos();
                    if (lista.isEmpty()) {
                        System.out.println("No hay usuarios activos.");
                    } else {
                        System.out.println("\n--- LISTADO DE USUARIOS ACTIVIOS ---");
                        lista.forEach(u -> System.out.println("ID: " + u.getId() + " | " + u.getApellido() + ", " + u.getNombre() + " | Mail: " + u.getMail() + " | Rol: " + u.getRol()));
                    }
                    break;

                    case 5: // BUSCAR POR EMAIL
                    System.out.print("Ingrese email del usuario para buscarlo: ");
                    try {
                        String emailABuscar = scanner.nextLine();
                        Optional<Usuario> optU = usuarioRepo.buscarPorMail(emailABuscar);
                        if (optU.isEmpty()) { System.out.println("Error: El usuario no existe o ya está de baja."); break; }

                        Usuario u = optU.get();

                        System.out.println("Usuario encontrado: " + u.getNombre() + " " + u.getApellido() + " | celular:" + u.getCelular() + " | rol:" + u.getRol());

                    } catch (Exception e) {
                        System.out.println("Error al guardar: " + e.getMessage());
                    }
                    break;

                case 0:
                    System.out.println("Retornando al menú principal...");
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        } while (opcion != 0);
    }


    // =========================================================================
    // ABM PEDIDOS
    // =========================================================================

    private static void menuPedidos() {
        int opcion;
        do {
            System.out.println("\n--- SUBMENÚ PEDIDOS ---");
            System.out.println("1. Alta de pedido");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("5. Pedidos por usuario");
            System.out.println("6. Pedidos por estado");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");
            try {
                opcion = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                opcion = -1;
            }

            switch (opcion) {
                // TO DO verificar funcionamiento
                //estan bien los continue?
                case 1: // ALTA DE PEDIDO (FLUJO DE TRANSACCIÓN ÚNICA)

                    // DETERMINAR USUARIO
                    List<Usuario> usuarios = usuarioRepo.listarActivos();
                    if (usuarios.isEmpty()) {
                        System.out.println("No existen usuarios activos en el sistema. Operación cancelada.");
                        break;
                    }
                    System.out.println("Usuarios activos disponibles:");
                    usuarios.forEach(u -> System.out.println("  [" + u.getId() + "] " + u.getApellido() + ", " + u.getNombre()));

                    System.out.print("Seleccione el ID del usuario: ");
                    Long idUsuario;
                    try {
                        idUsuario = Long.parseLong(scanner.nextLine()); }
                    catch (NumberFormatException e) {
                        System.out.println("ID inválido."); break;
                    }

                    Optional<Usuario> optU = usuarioRepo.buscarPorId(idUsuario);
                    if (optU.isEmpty()) { System.out.println("Error: El usuario no existe o está inactivo."); break; }
                    Usuario usuarioSeleccionado = optU.get();

                    // DETERMINAR FORMA DE PAGO
                    System.out.print("Ingrese Forma de Pago (TARJETA, TRANSFERENCIA, EFECTIVO): ");
                    String fpStr = scanner.nextLine().trim().toUpperCase();
                    FormaPago formaPago;
                    try {
                        formaPago = FormaPago.valueOf(fpStr);
                    } catch (IllegalArgumentException e) {
                        System.out.println("Error: Opción de pago inválida.");
                        break;
                    }

                    // CARGA DE PRODUCTOS EN MEMORIA
                    List<ItemTemporal> carrito = new ArrayList<>();
                    boolean continuarAgregando = true;

                    do {
                        List<Producto> catalogo = productoRepo.listarActivos();
                        if (catalogo.isEmpty()) { System.out.println("Catálogo vacío."); break; }

                        System.out.println("\n--- Catálogo de Productos Activos ---");
                        catalogo.forEach(p -> System.out.println("  [" + p.getId() + "] " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock()));

                        System.out.print("Ingrese el ID del producto a agregar: ");
                        Long idProd;
                        try {
                            idProd = Long.parseLong(scanner.nextLine());
                        } catch (NumberFormatException e)
                        { System.out.println("ID inválido."); continue; }

                        Optional<Producto> optP = productoRepo.buscarPorId(idProd);
                        if (optP.isEmpty()) { System.out.println("Error: El producto no existe o está dado de baja."); continue; }
                        Producto prod = optP.get();

                        if (!prod.isDisponible()) { System.out.println("Error: El producto no se encuentra disponible."); continue; }

                        System.out.print("Ingrese cantidad: ");
                        int cantidad;
                        try { cantidad = Integer.parseInt(scanner.nextLine()); } catch (NumberFormatException e) { System.out.println("Cantidad inválida."); continue; }
                        if (cantidad <= 0) { System.out.println("Error: La cantidad debe ser mayor a 0."); continue; }

                        // Calcular stock acumulado si ya se ingresó el mismo producto en el carrito
                        int cantYaCargada = carrito.stream().filter(item -> item.productoId.equals(idProd)).mapToInt(item -> item.cantidad).sum();
                        if ((cantidad + cantYaCargada) > prod.getStock()) {
                            System.out.println("Error: Stock insuficiente. Stock disponible: " + prod.getStock());
                            continue;
                        }

                        // Pasar validaciones -> Guardar en Memoria Temporal
                        carrito.add(new ItemTemporal(idProd, cantidad));
                        System.out.println("¡Producto añadido temporalmente!");

                        System.out.print("¿Desea agregar otro producto? (S/N): ");
                        String resp = scanner.nextLine().trim().toUpperCase();
                        if (resp.equals("N")) continuarAgregando = false;

                    } while (continuarAgregando);

                    if (carrito.isEmpty()) {
                        System.out.println("El pedido debe tener al menos un detalle. Operación cancelada.");
                        break;
                    }

                    // 4. PERSISTENCIA EN TRANSACCIÓN ÚNICA MANUAL
                    // Se usa la fábrica de managers de la app directamente para abrir uno limpio
                    EntityManager emManual = JPAUtil.getEntityManagerFactory().createEntityManager();
                    try {
                        emManual.getTransaction().begin();

                        // Instanciar Pedido limpio
                        Pedido nuevoPedido = Pedido.builder()
                                .fecha(java.time.LocalDate.now())
                                .estado(Estado.PENDIENTE)
                                .formaPago(formaPago)
                                .build();

                        System.out.println("\nProcesando y verificando stock final en base de datos...");
                        for (ItemTemporal item : carrito) {
                            // Recuperar el producto gestionado bajo este EntityManager actual
                            Producto prodGestionado = emManual.find(Producto.class, item.productoId);

                            // Doble verificación de seguridad de stock directamente en la BD antes del commit
                            if (item.cantidad > prodGestionado.getStock()) {
                                throw new Exception("Stock insuficiente de última hora para " + prodGestionado.getNombre() + ". Se cancela la transacción.");
                            }

                            // addDetallePedido internamente instancia DetallePedido, calcula subtotal y lo asocia
                            nuevoPedido.addDetallePedido(item.cantidad, prodGestionado);

                            // Modificar stock (El Dirty Checking lo impactará de forma automática en el commit)
                            prodGestionado.setStock(prodGestionado.getStock() - item.cantidad);
                        }

                        // Calcular el total general
                        nuevoPedido.calcularTotal();

                        // Persistimos el pedido (CascadeType.ALL guarda los detalles)
                        emManual.persist(nuevoPedido);

                        // Al ser una relación unidireccional controlada por Usuario, recuperamos el usuario en este EM y lo asociamos
                        Usuario userGestionado = emManual.find(Usuario.class, usuarioSeleccionado.getId());
                        userGestionado.getPedidos().add(nuevoPedido);

                        emManual.getTransaction().commit();

                        // 5. Mostrar resumen exitoso detallado
                        System.out.println("\n=========================================");
                        System.out.println(" ¡PEDIDO GUARDADO CON ÉXITO! ");
                        System.out.println("=========================================");
                        System.out.println("ID Generado: " + nuevoPedido.getId());
                        System.out.println("Fecha: " + nuevoPedido.getFecha());
                        System.out.println("Usuario: " + userGestionado.getNombre() + " " + userGestionado.getApellido());
                        System.out.println("Forma de Pago: " + nuevoPedido.getFormaPago());
                        System.out.println("-----------------------------------------");
                        System.out.println("Detalles del pedido:");
                        nuevoPedido.getDetalles().forEach(d -> System.out.println("  - " + d.getProducto().getNombre() + " x" + d.getCantidad() + " | Subtotal: $" + d.getSubtotal()));
                        System.out.println("-----------------------------------------");
                        System.out.println("TOTAL DEL PEDIDO: $" + nuevoPedido.getTotal());

                    } catch (Exception e) {
                        if (emManual.getTransaction().isActive()) {
                            emManual.getTransaction().rollback();
                        }
                        System.out.println("\nError: Ocurrió una excepción durante la transacción. Rollback ejecutado.");
                        System.out.println("Mensaje: " + e.getMessage());
                    } finally {
                        if (emManual != null && emManual.isOpen()) {
                            emManual.close();
                        }
                    }
                    break;

                case 2: // CAMBIAR ESTADO
                    System.out.print("Ingrese ID del pedido a modificar: ");
                    try {
                        Long idEst = Long.parseLong(scanner.nextLine());
                        Optional<Pedido> optP = pedidoRepo.buscarPorId(idEst);
                        if (optP.isEmpty()) { System.out.println("Pedido no encontrado o inactivo."); break; }
                        Pedido p = optP.get();

                        System.out.println("Estado actual: " + p.getEstado());
                        System.out.print("Ingrese nuevo estado (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
                        String nestStr = scanner.nextLine().trim().toUpperCase();
                        Estado nuevoEstado = Estado.valueOf(nestStr);

                        p.setEstado(nuevoEstado);
                        pedidoRepo.guardar(p); // Llama al baseRepository que procesará con merge()
                        System.out.println("¡Estado del pedido actualizado con éxito!");
                    } catch (Exception e) {
                        System.out.println("Error al cambiar estado: entrada inválida o estado no soportado.");
                    }
                    break;

                case 3: // BAJA LÓGICA
                    System.out.print("Ingrese ID del pedido a dar de baja (Cancelar): ");
                    try {
                        Long idBaja = Long.parseLong(scanner.nextLine());
                        Optional<Pedido> optP = pedidoRepo.buscarPorId(idBaja);
                        if (optP.isEmpty()) { System.out.println("Error: El pedido no existe."); break; }
                        Pedido ped = optP.get();

                        if (ped.getEstado() == Estado.TERMINADO) {
                            System.out.println("Error: No se puede dar de baja lógica un pedido en estado TERMINADO.");
                            break;
                        }

                        if (pedidoRepo.eliminarLogico(idBaja)) {
                            System.out.println("Baja lógica confirmada exitosamente para el Pedido #" + idBaja);
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case 4: // LISTADO GENERAL DE ACTIVOS
                    List<Pedido> activos = pedidoRepo.listarActivos();
                    if (activos.isEmpty()) {
                        System.out.println("No hay pedidos activos registrados.");
                    } else {
                        System.out.println("\n--- LISTADO GENERAL DE PEDIDOS ---");
                        activos.forEach(p -> System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() +" | Forma de pago: " + p.getFormaPago() + " | Total: $" + p.getTotal()));
                    }
                    break;

                case 5: // PEDIDOS POR USUARIO
                    usuarios = usuarioRepo.listarActivos();
                    if (usuarios.isEmpty()) { System.out.println("No hay usuarios activos."); break; }
                    usuarios.forEach(u -> System.out.println("  [" + u.getId() + "] " + u.getNombre() + " " + u.getApellido()));
                    System.out.print("Seleccione ID de Usuario: ");
                    try {
                        Long uid = Long.parseLong(scanner.nextLine());
                        List<Pedido> pUser = usuarioRepo.buscarPedidosPorUsuario(uid);
                        if (pUser.isEmpty()) {
                            System.out.println("El usuario no registra pedidos activos.");
                        } else {
                            System.out.println("\nPedidos del usuario seleccionado:");
                            pUser.forEach(p -> System.out.println("  -> Pedido #" + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal()));
                        }
                    } catch (NumberFormatException e) { System.out.println("ID inválido."); }
                    break;

                case 6: // PEDIDOS POR ESTADO
                    System.out.print("Ingrese el estado a filtrar (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
                    String estStr = scanner.nextLine().trim().toUpperCase();
                    try {
                        Estado est = Estado.valueOf(estStr);
                        List<Pedido> pEst = pedidoRepo.buscarPorEstado(est);
                        if (pEst.isEmpty()) {
                            System.out.println("No se encontraron pedidos en ese estado.");
                        } else {
                            System.out.println("\nPedidos con estado " + est + ":");
                            pEst.forEach(p -> System.out.println("  -> Pedido #" + p.getId() + " | Total: $" + p.getTotal() + " | Pago: " + p.getFormaPago()));
                        }
                    } catch (IllegalArgumentException e) { System.out.println("Estado inválido."); }
                    break;

                case 0:
                    System.out.println("Retornando al menú principal...");
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        } while (opcion != 0);
    }

    // =========================================================================
    // SUBMENU DE REPORTES
    // =========================================================================

    private static void menuReportes() {
        int opcion;
        do {
            System.out.println("\n--- SUBMENÚ REPORTES Y CONSULTAS ---");
            System.out.println("1. Buscar pedidos de un usuario");
            System.out.println("2. Buscar pedidos por estado");
            System.out.println("3. Calcular total facturado (Pedidos TERMINADOS)");
            System.out.println("0. Volver");
            System.out.print("Seleccione una opción: ");
            try {
                opcion = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                opcion = -1;
            }

            switch (opcion) {
                case 1: // PEDIDOS POR USUARIO
                    List<Usuario> usuarios = usuarioRepo.listarActivos();
                    if (usuarios.isEmpty()) { System.out.println("No hay usuarios activos."); break; }
                    usuarios.forEach(u -> System.out.println("  [" + u.getId() + "] " + u.getNombre() + " " + u.getApellido()));

                    System.out.print("Seleccione el ID del usuario: ");
                    try {
                        Long uId = Long.parseLong(scanner.nextLine());
                        Optional<Usuario> userOpt = usuarioRepo.buscarPorId(uId);
                        if (userOpt.isEmpty()) { System.out.println("Usuario inválido."); break; }

                        List<Pedido> pedidosUser = usuarioRepo.buscarPedidosPorUsuario(uId);
                        if (pedidosUser.isEmpty()) {
                            System.out.println("El usuario " + userOpt.get().getNombre() + " no registra pedidos activos.");
                        } else {
                            System.out.println("\nPedidos de " + userOpt.get().getNombre() + ":");
                            pedidosUser.forEach(p -> System.out.println("  -> Pedido #" + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal()));
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID de usuario inválido.");
                    }
                    break;

                case 2: // PEDIDOS POR ESTADO
                    System.out.print("Ingrese el estado a filtrar (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
                    String estStr = scanner.nextLine().trim().toUpperCase();
                    try {
                        Estado estadoFiltro = Estado.valueOf(estStr);
                        List<Pedido> pedidosEstado = pedidoRepo.buscarPorEstado(estadoFiltro);
                        if (pedidosEstado.isEmpty()) {
                            System.out.println("No se encontraron pedidos activos con el estado: " + estadoFiltro);
                        } else {
                            System.out.println("\nPedidos con estado " + estadoFiltro + ":");
                            pedidosEstado.forEach(p -> System.out.println("  -> Pedido #" + p.getId() + " | Fecha: " + p.getFecha() + " | Total: $" + p.getTotal() + " | Pago: " + p.getFormaPago()));
                        }
                    } catch (IllegalArgumentException e) {
                        System.out.println("Estado de pedido inválido.");
                    }
                    break;

                case 3: // TOTAL FACTURADO (REQUISITO ESTRICTO DE REPRESENTACIÓN MONETARIA)
                    // Buscamos todos los pedidos en estado TERMINADO
                    List<Pedido> pedidosTerminados = pedidoRepo.buscarPorEstado(Estado.TERMINADO);

                    // Sumamos los montos totales considerando nulls como 0.0 utilizando Streams
                    double totalFacturado = pedidosTerminados.stream()
                            .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                            .sum();

                    // Formato exigido de manera explícita por la cátedra para evitar desvíos de punto flotante en Double
                    String resultadoFormateado = String.format(java.util.Locale.US, "$%.2f", totalFacturado);

                    System.out.println("\n=========================================");
                    System.out.println(" REPORTES FINANCIEROS DE FACTURACIÓN     ");
                    System.out.println("=========================================");
                    System.out.println("Total facturado (Pedidos TERMINADOS): " + resultadoFormateado);
                    System.out.println("Cantidad de órdenes completadas: " + pedidosTerminados.size());
                    break;

                case 0:
                    System.out.println("Retornando al menú principal...");
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        } while (opcion != 0);
    }

    // =========================================================================
    // CARGA DE DATOS INICIALES
    // =========================================================================


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

    private static class ItemTemporal {
        Long productoId;
        int cantidad;

        public ItemTemporal(Long productoId, int cantidad) {
            this.productoId = productoId;
            this.cantidad = cantidad;
        }
    }

}


