import { validarAccesoRuta, obtenerEstadoCliente } from "../../../../src/utils/guards/guards";
import type { IOrder } from "../../../types/IOrder"
import { getOrders } from "../../../utils/fetch"


if (validarAccesoRuta()) {
  const { isAdmin, usuarioId } = obtenerEstadoCliente();

  // traer los pedidos 
  const todosLosPedidos = await getOrders()
  
  todosLosPedidos? () => {
      // Filtrado
      const pedidosAVisualizar = isAdmin 
        ? todosLosPedidos // Admin ve todo
        : todosLosPedidos.filter(p => p.usuarioDto.id === usuarioId); // Usuario ve los suyos

      renderizarTablaPedidos(pedidosAVisualizar);
    };
}

// función que abre el modal de detalles del pedido
function abrirModalPedido(pedido: IOrder) {
  const { isAdmin } = obtenerEstadoCliente();
  const contenedorAccion = document.getElementById("modal-acciones-admin");

  if (contenedorAccion) {
    if (isAdmin) {
      contenedorAccion.innerHTML = `
        <label>Cambiar Estado:</label>
        <select id="select-estado">
          <option ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
          <option ${pedido.estado === 'EN_PREPARACION' ? 'selected' : ''}>EN_PREPARACION</option>
          <option ${pedido.estado === 'ENTREGADO' ? 'selected' : ''}>ENTREGADO</option>
        </select>
      `;
    } else {
      contenedorAccion.innerHTML = `<p><strong>Estado actual:</strong> ${pedido.estado}</p>`;
    }
  }
}


function renderizarTablaPedidos(pedidos: IOrder[]) {
  
}