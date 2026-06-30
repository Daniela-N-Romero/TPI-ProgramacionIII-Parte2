import { navigate } from "../../../utils/guards/guards";
import { ModalService } from "../../../utils/modals/modal";
import { getCategories } from "../../../utils/storage/categoryStorage";
import { getOrders } from "../../../utils/storage/orderStorage";
import { getProducts } from "../../../utils/storage/productStorage";
import { getActiveUser } from "../../../utils/storage/userStorage";

document.addEventListener("DOMContentLoaded", () => {
    ModalService.init();
    const user = getActiveUser();
    const main = document.querySelector(".main-content");
    if (user?.rol === "ADMIN") {
        main?.classList.add("main-content-block")
        renderCounters();
        renderResumen();
    } else {
        navigate("./tienda")
    }
});
const productos = await getProducts();
const pedidos = await getOrders();
const categories = await getCategories();
const disponibles = productos.filter(p => p.disponible === true);

//contabilizar
const totalCategorias = categories.length.toString();
const totalProductos = productos.length.toString();
const totalPedidos = pedidos.length.toString();
const productosActivos = productos.filter(p => p.disponible).length.toString();
const productosInactivos = productos.filter(p => !p.disponible).length.toString();

const renderCounters = async () => {
    const counterProductos = document.querySelector(".counter-productos")
    const counterCategorias = document.querySelector(".counter-categorias")
    const counterDisponibles = document.querySelector(".counter-productos-disponibles")
    const counterPedidos = document.querySelector(".counter-pedidos")

    if (counterProductos) {
        counterProductos.innerHTML = totalProductos;
    }

    if (counterCategorias) {
        counterCategorias.innerHTML = totalCategorias;
    }

    if (counterPedidos) {
        counterPedidos.innerHTML = totalPedidos;
    }

    if (counterDisponibles) {
        counterDisponibles.innerHTML = productosActivos;
    }

}


const renderResumen = () => {
    const summaryPanel = document.querySelector('.summary-panel');
    if (!summaryPanel) return;

    try {

        // Inicializamos las métricas de Pedidos agrupados por estado
        let pendientes = 0;
        let confirmados = 0;
        let terminados = 0;
        let cancelados = 0;

        pedidos.forEach(pedido => {
            switch (pedido.estado) {
                case 'PENDIENTE': pendientes++; break;
                case 'CONFIRMADO': confirmados++; break;
                case 'TERMINADO': terminados++; break;
                case 'CANCELADO': cancelados++; break;
            }
        });

        // Inyectamos HTML limpio utilizando únicamente clases descriptivas
        summaryPanel.innerHTML = `
<h3 class="summary-title">📊 Resumen Rápido</h3>
      
      <div class="dashboard-grid">
        
        <div class="summary-card border-blue">
          <h4 class="card-sub-title">📂 Catálogo</h4>
          <p class="summary-item"><strong>Categorías:</strong> <span class="summary-count">${totalCategorias}</span></p>
          <p class="summary-item text-success-muted"><strong>Activos:</strong> <span>${productosActivos}</span></p>
          <p class="summary-item text-danger-muted"><strong>Inactivos:</strong> <span>${productosInactivos}</span></p>
        </div>

        <div class="summary-card border-orange">
          <h4 class="card-sub-title">⏳ Pedidos en Proceso</h4>
          <p class="summary-item">
            <span class="status-badge status-pendiente">PENDIENTE</span>
            <strong class="summary-count">${pendientes}</strong>
          </p>
          <p class="summary-item">
            <span class="status-badge status-confirmado">CONFIRMADO</span>
            <strong class="summary-count">${confirmados}</strong>
          </p>
          <p class="summary-item">
            <span class="status-badge">EN PREPARACIÓN</span>
            <strong class="summary-count">${cancelados}</strong>
          </p>
        </div>

        <div class="summary-card border-green">
          <h4 class="card-sub-title">✅ Completados</h4>
          <p class="summary-item" style="margin-top: 10px;">
            <span class="status-badge status-terminado">TERMINADO</span>
            <strong class="summary-count-highlight">${terminados}</strong>
          </p>
          <p class="summary-footer">
            Total histórico: ${pedidos.length} órdenes
          </p>
        </div>

      </div>
    `;

    } catch (error) {
        console.error("Error al renderizar el resumen del panel de control:", error);
        summaryPanel.innerHTML = `
      <h3 class="summary-title">📊 Resumen Rápido</h3>
      <p style="color: #e53e3e;">⚠️ No se pudieron cargar las estadísticas.</p>
    `;
    }
};

