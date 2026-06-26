import { getOrdersByEmail } from '../../../utils/storage/orderStorage';
import { getActiveUser } from '../../../utils/storage/userStorage';
import { ModalService } from '../../../utils/modal';
import type { IUserDTO } from '../../../types/IUser';
import { filtrarPedidosPorEstado, ordenarPedidosPorFechaDesc } from '../../admin/orders/orders';
import type { IOrder } from '../../../types/IOrder';

document.addEventListener("DOMContentLoaded", () => {
  ModalService.init();
  const user = getActiveUser();
  const main = document.querySelector(".main-content");
  console.log(main)
  if (user.rol === "USUARIO") {
    main?.classList.add("main-content-block")
    renderMisPedidos(user);
  }
});

export const renderMisPedidos = async (user: IUserDTO) => {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  if (!user) {
    mainContent.innerHTML = `<p class="error-msg">Debes iniciar sesión para ver tus pedidos.</p>`;
    return;
  }

  // Traemos los pedidos específicos del cliente logueado
  const todosLosPedidos = await getOrdersByEmail(user.mail);

  if (todosLosPedidos.length === 0) {
    mainContent.innerHTML = `<div class="empty-container">
                <p>Todavia no tenés pedidos realizados.</p>
                <button class="btn btn-primary" onclick="window.location.href='/tienda'">Ir a la Tienda</button>
            </div>`;
    return;
  }

  // Limpiamos e insertamos el contenedor principal
  mainContent.classList.add("page-container")
  mainContent.innerHTML = `
    <div class="orders-page-header">
      <h2 class="section-title">Mis Pedidos</h2>
      <div class="filter-container">
      <select id="status-filter" class="form-select">
          <option value="TODOS">Todos los pedidos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="EN_PREPARACION">En Preparación</option>
          <option value="ENTREGADO">Entregado</option>
        </select>
      </div>
    </div>
    <div id="orders-list-container" class="orders-container"></div>
  `;

  const listContainer = document.getElementById('orders-list-container') as HTMLDivElement;
  const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;

  const actualizarVistaPedidos = () => {
    const estadoFiltrado = statusFilter.value;
   
    // Primero filtramos, luego ordenamos cronológicamente de forma descendente
    const pedidosFiltrados = filtrarPedidosPorEstado(todosLosPedidos, estadoFiltrado);
    const pedidosOrdenados = ordenarPedidosPorFechaDesc(pedidosFiltrados);

    // Estado vacío
    if (pedidosOrdenados.length === 0) {
      listContainer.innerHTML = `<p class="empty-state-msg">No se encontraron pedidos en este estado.</p>`;
      return;
    }

    listContainer.innerHTML = '';

    // Generamos las tarjetas
    pedidosOrdenados.forEach(pedido => {
      const card = document.createElement('div');
      card.className = 'order-card user-order';
      card.setAttribute('data-id', pedido.id.toString());

      const primerosProductos = pedido.detalles.slice(0, 3);
      const resumenHTML = primerosProductos.map(item => `
        <div class="order-summary-row">
          <span>${item.cantidad}x ${item.producto.nombre}</span>
        </div>
      `).join('');

      const tieneMasProductos = pedido.detalles.length > 3
        ? `<span class="more-items-indicator">...y ${pedido.detalles.length - 3} más</span>`
        : '';

      card.innerHTML = `
      <div class="order-header">
        <div>
          <p class="order-id">Pedido ORD#${pedido.id}</p>
          <p class="order-date">${pedido.fecha}</p>
        </div>
          <span class="status-badge status-${pedido.estado.toLowerCase()}">${pedido.estado}</span>
      </div>
      <div class="order-body">
        <ul class="order-products-list">
          ${resumenHTML}
          ${tieneMasProductos}
        </ul>
      </div>
      <div class="order-footer">
        <p class="order-total-products">📦 ${pedido.detalles.reduce((acc, item) => acc + item.cantidad, 0)} producto(s)</p>
        <p class="order-total">$${pedido.total}</p>
      </div>
    `;
      card?.addEventListener('click', () => {
        abrirModalDetallePedido(pedido);
      });

      listContainer.appendChild(card)
    });
    statusFilter.addEventListener('change', actualizarVistaPedidos);
  }
  actualizarVistaPedidos();
};

export const abrirModalDetallePedido = (pedido: IOrder) => {
  // Render de la lista completa de productos
  const listaProductosHTML = pedido.detalles.map(item => `
    <div class="modal-detail-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem;">
      <span><strong>${item.cantidad}x</strong> ${item.producto.nombre}</span>
      <span>$${item.subtotal}</span>
    </div>
  `).join('');

  // Armamos el contenedor que encajará con tu .modal-card
  const modalContentHTML = `
    <div class="order-modal-detail">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <h3 style="margin: 0;">Detalle de Pedido #${pedido.id}</h3>
        <span class="status-badge status-${pedido.estado.toLowerCase()}" style="padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">
          ${pedido.estado.replace('_', ' ')}
        </span>
      </div>

      <div class="form-group">
        <label>Información de Entrega y Compra</label>
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 0.9rem; line-height: 1.5;">
          <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> ${pedido.fecha}</p>
          <p style="margin: 4px 0;"><strong>Forma de Pago:</strong> ${pedido.formaPago}</p>
          <p style="margin: 4px 0;"><strong>Cliente:</strong> ${pedido.usuarioDto.nombre} (${pedido.usuarioDto.mail})</p>
        </div>
      </div>

      <div class="form-group">
        <label>Lista de Productos</label>
        <div style="max-height: 200px; overflow-y: auto; padding-right: 5px;">
          ${listaProductosHTML}
        </div>
      </div>

      <div class="modal-footer-total">
        <div style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>$${pedido.total - 500}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">
            <span>$Envío:</span>
            <span>$500</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; border-top: 1px dashed var(--border-color); padding-top: 8px;">
            <span>Total Final:</span>
            <span>$${pedido.total}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Disparamos el Modal global de tu aplicación
  ModalService.open(modalContentHTML);
};