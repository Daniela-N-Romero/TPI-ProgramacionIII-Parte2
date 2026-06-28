import type {IProduct} from "./IProduct"

export interface ICartItem {
  producto: IProduct;
  cantidad: number;
  subtotal: number;
}