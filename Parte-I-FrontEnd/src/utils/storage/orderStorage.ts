import type { IOrder } from "../../types/IOrder";
import { getElementById, saveOrUpdate, getElementsFromStorage, saveArray } from "./storageBase"


//Funciones para traer, modificar, crear y eliminar datos del storage

export const getOrder = (id: number) => getElementById<IOrder>(id, "orders");
export const getOrders = () => getElementsFromStorage<IOrder>("orders");

export const getOrdersByEmail = async (email: string): Promise<IOrder[]> => await getElementsFromStorage<IOrder>(`orders_${email}`);
export const saveOrdersByEmail = (email: string, orders: IOrder[]): void => {
  // Reemplazamos localStorage directo por tu función genérica
  saveArray(orders, `orders_${email}`);
};

export const registrarNuevoPedidoDelCliente = async (email: string, nuevoPedido: IOrder): Promise<void> => {
  // Lo guardamos en el historial del cliente (LocalStorage real)
  const pedidosCliente = await getOrdersByEmail(email);
  pedidosCliente.push(nuevoPedido);
  saveOrdersByEmail(email, pedidosCliente);

  // Lo sumamos a la lista global para que el Admin lo vea en su panel (SessionStorage / Memoria)
  saveOrUpdate(nuevoPedido, "orders");
};

export const saveOrUpdateOrder = async (pedidoActualizado: IOrder) => {
  saveOrUpdate(pedidoActualizado, "orders")
  const emailCliente = pedidoActualizado.usuarioDto.mail; 

  if (emailCliente) {
    // Traemos el historial del cliente
    const pedidosCliente = await getOrdersByEmail(emailCliente);
    
    // Buscamos si el pedido ya existía en su historial
    const index = pedidosCliente.findIndex(p => p.id === pedidoActualizado.id);
    
    if (index !== -1) {
      pedidosCliente[index] = pedidoActualizado;
    } else {
      pedidosCliente.push(pedidoActualizado);
    }
        // Guardamos el historial del cliente actualizado
    saveOrdersByEmail(emailCliente, pedidosCliente);
  }
};
