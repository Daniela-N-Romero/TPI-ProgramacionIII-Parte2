import type { IOrder } from "../../types/IOrder";
import { getElementById, saveOrUpdate, getElementsFromStorage, saveArray } from "./storageBase"


//Funciones para traer, modificar, crear y eliminar datos del storage

export const getOrder = (id: number) => getElementById<IOrder>(id,"orders");
export const getOrders = () => getElementsFromStorage<IOrder>("orders");
export const saveOrUpdateOrder = (Order: IOrder)  => saveOrUpdate(Order ,"orders")

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

