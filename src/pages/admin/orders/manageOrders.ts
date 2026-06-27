import { getOrders, saveOrUpdateOrder } from '../../../utils/storage/orderStorage';
import type { IOrder, Estado } from '../../../types/IOrder';
import { ModalService } from '../../../utils/modals/modal';
import { getActiveUser } from '../../../utils/storage/userStorage';
import { navigate } from '../../../utils/guards/guards';
import { filtrarPedidosPorEstado, formatearFechaParaPantalla, ordenarPedidosPorFechaDesc } from '../../../utils/orders/orders';
import { AlertService } from '../../../utils/modals/alert';


document.addEventListener("DOMContentLoaded", () => {
  ModalService.init();
  const user = getActiveUser();
  const main = document.querySelector(".main-content");
  if (user?.rol === "ADMIN") {
    main?.classList.add("main-content-block")
    renderGestionPedidos();
  } else {
    navigate("./tienda")
  }
});


export const renderGestionPedidos = async () => {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  // El administrador ve TODOS los pedidos globales
  const todosLosPedidos: IOrder[] = await getOrders();

  if (todosLosPedidos.length === 0) {
    mainContent.innerHTML = `<p class="info-msg">No hay pedidos registrados en el sistema.</p>`;
    return;
  }
  mainContent.innerHTML = `
    <h2 class="section-title">Gestión de Pedidos (Admin)</h2>
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
      card.className = 'order-card admin-order';

      card.innerHTML = `
      <div class="order-header">
        <span class="order-id">Pedido #${pedido.id}</span>
        <span class="order-date">${formatearFechaParaPantalla(pedido.fecha)}</span>
      </div>
      <div class="order-body">
        <p><strong>Cliente:</strong> ${pedido.usuarioDto.nombre} (${pedido.usuarioDto.mail})</p>
        <p><strong>Pago:</strong> ${pedido.formaPago}</p>
        <p class="order-total">Total: <strong>$${pedido.total}</strong></p>
      </div>
      <div class="order-footer">
        <p class="order-total-products">📦 ${pedido.detalles.reduce((acc, item) => acc + item.cantidad, 0)} producto(s)</p>
        <label for="status-${pedido.id}">Estado: <span class="status-badge status-${pedido.estado.toLowerCase()}">${pedido.estado}</span></label>
      </div>
    `;

      // Escuchar el cambio de estado de este pedido específico
      const selector = card.querySelector<HTMLSelectElement>(`#status-${pedido.id}`);
      selector?.addEventListener('change', async (e) => {
        const nuevoEstado = (e.target as HTMLSelectElement).value as Estado;

        // Actualizamos el objeto pedido localmente y lo guardamos
        pedido.estado = nuevoEstado;
        await saveOrUpdateOrder(pedido);
        AlertService.success(
              "Éxito",
              `Modificaste el estado del pedido a ${nuevoEstado}`
        );

      });

      card?.addEventListener('click', () => {
        abrirModalDetallePedido(pedido);
      });


      listContainer.appendChild(card);
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
          <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> ${formatearFechaParaPantalla(pedido.fecha)}</p>
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
      <div class="order-actions">
      <div>
        <label for="status-${pedido.id}">Estado:</label>
        <select id="status-${pedido.id}" class="status-selector" data-id="${pedido.id}">
          <option value="PENDIENTE" ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
          <option value="CONFIRMADO" ${pedido.estado === 'CONFIRMADO' ? 'selected' : ''}>CONFIRMADO</option>
          <option value="EN_PREPARACION" ${pedido.estado === 'EN_PREPARACION' ? 'selected' : ''}>EN_PREPARACION</option>
          <option value="ENTREGADO" ${pedido.estado === 'ENTREGADO' ? 'selected' : ''}>ENTREGADO</option>
        </select>
        </div>
        <button class="save-order">Guardar</button>
      </div>
    </div>
  `;

  //TO corregir comentarios y estilos del select y guardar del modal
  // Disparamos el Modal global de tu aplicación
  ModalService.open(modalContentHTML, () => {
    
    // Buscamos el selector usando el ID correcto con '#'
    const statusSelect = document.getElementById(`status-${pedido.id}`) as HTMLSelectElement;
    const saveBtn = document.querySelector(".save-order") as HTMLButtonElement;

    if (saveBtn && statusSelect) {
      saveBtn.addEventListener("click", async () => {
        // Capturamos el valor seleccionado EN EL MOMENTO del click
        const nuevoEstado = statusSelect.value as Estado;
        
        // Actualizamos el objeto pedido
        pedido.estado = nuevoEstado;
        
        // Guardamos los cambios usando tu storage
        await saveOrUpdateOrder(pedido);
        renderGestionPedidos();
        
        AlertService.success(`Actualización realizada`, `Pedido #${pedido.id} actualizado a ${nuevoEstado} con éxito.`)
      
        
        // Opcional: Cerrás el modal automáticamente tras guardar
        ModalService.close();
        
        // Opcional: Aquí podrías llamar a una función para refrescar la lista de la pantalla principal (ej: renderGestionPedidos)
      });
    }
  });
};
