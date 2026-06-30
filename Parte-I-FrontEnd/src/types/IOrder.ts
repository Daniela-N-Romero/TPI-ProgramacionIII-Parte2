import type { IProduct } from "./IProduct";
import type { IUserDTO } from "./IUser";

export interface IOrder {
    id: number;
    fecha: string;
    estado: Estado;
    total: number;
    formaPago: FormaPago;
    detalles: {
        cantidad: number;
        subtotal: number;
        producto: IProduct;
    }[];
    usuarioDto: IUserDTO;
}

export type Estado = "CANCELADO" | "CONFIRMADO" | "PENDIENTE" | "TERMINADO";
export type FormaPago = "TRANSFERENCIA" | "EFECTIVO" | "TARJETA" ;
