
//Funciones auxiliares para pedidos
import type { IOrder } from "../../types/IOrder";

export const ordenarPedidosPorFechaDesc = (pedidos: IOrder[]): IOrder[] => {
  return [...pedidos].sort((a, b) => {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();

  });
};

export const formatearFechaParaPantalla = (fechaIso: string): string => {
    const fecha = new Date(fechaIso);

  // "27 de junio de 2026"
  const opcionesFecha: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long", // Devuelve el nombre completo del mes en minúscula
    year: "numeric"
  };

  //"15:30"
  const opcionesHora: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false // Formato de 24 horas
  };

  const textoFecha = fecha.toLocaleDateString("es-AR", opcionesFecha);
  const textoHora = fecha.toLocaleTimeString("es-AR", opcionesHora);
  return `${textoFecha}, ${textoHora}hs`;
};

export const filtrarPedidosPorEstado = (pedidos: IOrder[], estadoSeleccionado: string): IOrder[] => {
  if (!estadoSeleccionado || estadoSeleccionado === 'TODOS') {
    return pedidos;
  }
  return pedidos.filter(pedido => pedido.estado === estadoSeleccionado);
};