import { obtenerEstadoCliente, navigate, validarAccesoRuta } from "../../../../src/utils/guards/guards";
import type { IProduct } from "../../../types/IProduct";
import { actualizarBadgeNavbar } from "../../../utils/layout";
import { addToCart } from "../../../utils/storage/cartStorage";
import { getProducts } from "../../../utils/storage/productStorage";
import { getActiveUser } from "../../../utils/storage/userStorage";


//TO DO: revisar comentarios
// VARIABLES DE ESTADO LOCAL (Para combinar filtros y ordenamientos en tiempo real)
let categoriaSeleccionadaId: number | 'todas' = 'todas';
let busquedaTexto: string = "";
let ordenSeleccionado: string = "none";

// Funciones de la tienda
const configurarFiltroCategorias = (): void => {

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

      // Actualizar estado de categoría
      if (categoriaIdRaw === 'todas') {
        categoriaSeleccionadaId = 'todas';
      } else {
        categoriaSeleccionadaId = parseInt(categoriaIdRaw);
      }
      renderSegunCategoria();
    });
  });
};


const renderSegunCategoria = async (): Promise<void> => {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;

  // Traer los productos frescos desde memoria
  let productos: IProduct[] = await getProducts();
  productos = productos.filter(p => p.disponible === true);

  // A) FILTRADO POR CATEGORÍA
  if (categoriaSeleccionadaId !== 'todas') {
    productos = productos.filter(p => p.categoria && p.categoria.id === categoriaSeleccionadaId);
  }

  // B) FILTRADO POR BÚSQUEDA EN TIEMPO REAL (Filtra por nombre sin importar mayúsculas/minúsculas)
  if (busquedaTexto.trim() !== "") {
    const texto = busquedaTexto.toLowerCase().trim();
    productos = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  }

  // C) ORDENAMIENTO (Mutación controlada en el array filtrado)
  if (ordenSeleccionado !== "none") {
    switch (ordenSeleccionado) {
      case "az": productos.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case "za": productos.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      case "price-asc": productos.sort((a, b) => a.precio - b.precio); break;
      case "price-desc": productos.sort((a, b) => b.precio - a.precio); break;
    }
  }

  // D) RENDERIZADO DEL HTML DE PRODUCTOS
  if (productos.length === 0) {
    productsContainer.innerHTML = `
      <div class="no-products-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 1.2rem;">No se encontraron productos disponibles.</p>
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = productos.map(prod => {
    // Validar Requisito: Botón Agregar al Carrito no disponible si stock = 0 o si no está disponible
    const sinStock = prod.stock <= 0;
    
    return `
      <div data-id="${prod.id}" style="cursor: pointer;" class="product-card ${!prod.disponible ? 'product-disabled' : ''}" >
        <div class="product-image-container">
          <img src="${prod.imagen || 'https://placehold.co/300'}" alt="${prod.nombre}" class="product-img">
        </div>
        <div class="product-info">
          <h3 class="product-title">${prod.nombre}</h3>
          <p class="product-description">${prod.descripcion}</p>
          <div class="product-meta">
            <span class="product-price">$${prod.precio.toLocaleString('es-AR')}</span>

            ${sinStock ? '<span class="badge-sin-stock">Sin stock.</span>' : `<span class="product-stock-text">Disponibles: ${prod.stock} u.</span>`}
          </div>
          <button class="btn btn-add-cart" data-id="${prod.id}" ${sinStock ? 'disabled style="background: #cbd5e1; cursor: not-allowed;"' : ''}>
            ${sinStock ? 'Agotado' : '🛒 Agregar'}
          </button>
        </div>
      </div>
    `;
  }).join('');
  configurarBotonesCarrito();
  configurarClickDetalle();
};

const configurarBotonesCarrito = (): void => {

 const btnsAgregar = document.querySelectorAll(".btn-add-cart");
  const usuarioActivo = getActiveUser();

  btnsAgregar.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      // Verificar permisos con tu guarda pedagógica
      if (!verificarPermiso(e)) return;

      const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
      const productos = await getProducts();
      const productoSeleccionado = productos.find(p => p.id === id);

      if (productoSeleccionado && usuarioActivo?.mail) {
        // Añadir al storage del carrito por email
        await addToCart(productoSeleccionado, 1, usuarioActivo.mail);
        // Actualizar el numerito del carrito en el navbar
        await actualizarBadgeNavbar();
      }
    });
  });
};

const configurarClickDetalle = (): void => {
  const tarjetas = document.querySelectorAll(".product-card");
  
  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener("click", (e) => {
      const id = (e.currentTarget as HTMLDivElement).getAttribute("data-id");
      if (id) {
        navigate(`/producto?id=${id}`);
      }
    });
  });
};

const verificarPermiso = (e: Event): boolean => {
  const { isInvitado, isAdmin } = obtenerEstadoCliente();
  if (isAdmin) {
    alert("Los administradores no pueden realizar compras en la tienda.");
    return false;
  } else if (isInvitado) {
    e.stopImmediatePropagation();
    navigate("/login");
    return false;
  }
  return true;
};

// Configuración de inputs de las herramientas de control en la tienda
const configurarControlesHerramientas = (): void => {
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;

  searchInput?.addEventListener("input", (e) => {
    busquedaTexto = (e.target as HTMLInputElement).value;
    renderSegunCategoria(); // Re-renderiza sumando filtros acumulados
  });

  sortSelect?.addEventListener("change", (e) => {
    ordenSeleccionado = (e.target as HTMLSelectElement).value;
    renderSegunCategoria(); // Re-renderiza sumando ordenamiento acumulado
  });
};

const main = document.getElementById("main-view");

if (validarAccesoRuta()) {
  main?.classList.add("main-content-block");
  configurarFiltroCategorias();
  configurarControlesHerramientas();
  
  // Render inicial con todo en 'todas' y 'none'
  renderSegunCategoria();
}