import { obtenerEstadoCliente, navigate, validarAccesoRuta } from "../../../../src/utils/guards/guards";
import { actualizarBadgeNavbar } from "../../../utils/layout";
import { addToCart } from "../../../utils/storage/cartStorage";
import { getProducts } from "../../../utils/storage/productStorage";
import { getActiveUser } from "../../../utils/storage/userStorage";

// VARIABLES DE ESTADO LOCAL (Para combinar filtros y ordenamientos en tiempo real)
let categoriaSeleccionadaId: number | 'todas' = 'todas';
let busquedaTexto: string = "";
let ordenSeleccionado: string = "none";

// Funciones de la tienda
const filtrarPorCategoria = (): void => {

  const linksCategoria = document.querySelectorAll('#app-sidebar .sidebar-menu a[data-categoria-id]');

  linksCategoria?.forEach(link => { //agregamos evento de click a categorias en el menu lateral
    link.addEventListener('click', async (e) => {
      e.preventDefault(); // Evitamos que la página se recargue o scrollee al inicio

      const target = e.currentTarget as HTMLAnchorElement;
      const categoriaIdRaw = target.dataset.categoriaId; //capturamos el id d ela categoria

      if (!categoriaIdRaw) return;

      // Manejo visual
      linksCategoria.forEach(l => l.parentElement?.classList.remove('active'));
      target.parentElement?.classList.add('active');

      // 
      const categoriaId = categoriaIdRaw === 'todas' ? 'todas' : Number(categoriaIdRaw);

      renderSegunCategoria(categoriaId);
    });
  });
};


const renderSegunCategoria = async (categoriaId: number | 'todas' = 'todas'): Promise<void> => {
  const productsContainer = document.getElementById('products-container');
  if (!productsContainer) return;
  const todosLosProductos = await getProducts();

  let productosFiltrados = todosLosProductos.filter(producto => {
    const perteneceACategoria = categoriaId === 'todas' || producto.categoria.id === categoriaId;
    return perteneceACategoria && producto.disponible;
  });

  if (busquedaTexto.trim() !== "") {
    productosFiltrados = productosFiltrados.filter(producto =>
      producto.nombre.toLowerCase().includes(busquedaTexto.toLowerCase())
    );
  }

  // Ordenamiento del array
  if (ordenSeleccionado === "az") {
    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (ordenSeleccionado === "za") {
    productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (ordenSeleccionado === "price-asc") {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (ordenSeleccionado === "price-desc") {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }

  productsContainer.innerHTML = '';
  if (productosFiltrados.length === 0) {
    productsContainer.innerHTML = `<p class="no-products">No hay productos disponibles en esta categoría por el momento.</p>`;
    return;
  }

  const { isAdmin } = obtenerEstadoCliente();

  productosFiltrados.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = `${producto.id}`;
    card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img">
            <div class="product-info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion}</p>
                <span class="product-price">$${producto.precio}</span>
                <span class="product-stock">Stock: ${producto.stock}</span>
                <button class="btn btn-primary btn-add-cart" data-id="${producto.id}" ${isAdmin ? 'disabled' : ''}>Agregar 🛒</button>
            </div>
        `;
    productsContainer.appendChild(card);
  });
  configurarBotonesCarrito(productsContainer);
};

const configurarBotonesCarrito = (container: HTMLElement): void => {

  // Removemos cualquier listener previo para evitar que se dupliquen los eventos
  container.replaceWith(container.cloneNode(true));

  // Volvemos a capturar el contenedor limpio
  const cleanContainer = document.getElementById('products-container')!;

  // Escuchamos los clics en todo el contenedor de productos
  cleanContainer.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn-add-cart')) {
      const productoId = Number(target.dataset.id); //capturamos el id del producto a agregar
      if (!productoId) return;

      if (verificarPermiso(e)) {

        try {
          const productos = await getProducts();
          const productoSeleccionado = productos.find(p => p.id === productoId);

          if (!productoSeleccionado) {
            alert("No se pudo encontrar el producto.");
            return;
          }

          const user = getActiveUser();
          await addToCart(productoSeleccionado, 1, user.mail );
          await actualizarBadgeNavbar();

        } catch (error) {
          console.error("Error al añadir al carrito:", error);
        }
        return //para no ser redirigido al sitio del detalle de producto
      }
    }
    const card = target.closest(".product-card") as HTMLElement;
    if (card) {
      const productoId = card.id;
      navigate(`/producto?id=${productoId}`);
    }
  });
};

const verificarPermiso = (e: Event): boolean => { //si tiene permiso a agregar productos
  const { isInvitado, isAdmin } = obtenerEstadoCliente();
  const btnsAgregar = document.querySelectorAll(".btn-add-cart");

  if (btnsAgregar) {
    if (isAdmin) {
      return false;
    } else if (isInvitado) {
      e.stopImmediatePropagation();
      navigate("/login");
      return false
    };
  }
  return true
}

// Configuración de inputs (Búsqueda y Ordenamiento)
//TO DO : Verificacion de funcionamiento de filtros en conjunto
const configurarControlesHerramientas = (): void => {
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;

  searchInput?.addEventListener("input", (e) => {
    busquedaTexto = (e.target as HTMLInputElement).value;
    renderSegunCategoria(categoriaSeleccionadaId); // Re-renderiza combinando filtros
  });

  sortSelect?.addEventListener("change", (e) => {
    ordenSeleccionado = (e.target as HTMLSelectElement).value;
    renderSegunCategoria(categoriaSeleccionadaId); // Re-renderiza combinando filtros
  });
};

const main = document.getElementById("main-view");

if (validarAccesoRuta()) {
  main?.classList.add("main-content-block")
  //Ejecutamos las funciones iniciales para activar los componentes
  filtrarPorCategoria();
  configurarControlesHerramientas();
  renderSegunCategoria('todas');
  actualizarBadgeNavbar();
};