import type { IProduct } from '../../types/IProduct';
import type { ICartItem } from '../../types/ICart'
import { AlertService } from '../modals/alert.ts'
import { getElementsFromStorage, saveArray, removeElement } from "./storageBase"

//Funciones para traer, modificar, crear y eliminar datos del carrtio de local storage

export const getCartByEmail = async (email: string) => await getElementsFromStorage<ICartItem>(`cart_${email}`);
export const saveCartByEmail = (email: string, cart: ICartItem[]) => saveArray(cart, `cart_${email}`);
export const clearCart = (email: string) => removeElement(`cart_${email}`);

export const removeFromCart = async (email: string, productId: number) => {
  const cart = await getCartByEmail(email);
  const cartFiltrado = cart.filter(item => item.producto.id !== productId);
  saveCartByEmail(email, cartFiltrado);
};

export async function addToCart(product: IProduct, cantidad: number = 1, userEmail: string): Promise<void> {
  const cart = await getCartByEmail(userEmail);
  const itemIndex = cart.findIndex(item => item.producto.id === product.id);

  if (itemIndex !== -1) { // Si ya existe, sumamos la cantidad 
    //validamos: cantidad actual en carrito + cantidad nueva NO debe superar el stock
    const cantidadFinal = cart[itemIndex].cantidad + cantidad;
    
    if (cantidadFinal > product.stock) {
      AlertService.warning(
        "Límite de Stock", 
        `No podés agregar más unidades de ${product.nombre}. Stock disponible: ${product.stock} u. (Ya tenés ${cart[itemIndex].cantidad} u. en el carrito)`
      );
      return; // Bloquea la ejecución y no guarda nada
    }

    cart[itemIndex].cantidad = cantidadFinal;    
    cart[itemIndex].subtotal = cart[itemIndex].cantidad * cart[itemIndex].producto.precio;

  } else {      
    // Si es nuevo en el carrito, validamos que la cantidad pedida no sea mayor al stock inicial
    if (cantidad > product.stock) {
      AlertService.warning(
        "Límite de Stock", 
        `No podés agregar esa cantidad. Stock disponible: ${product.stock} u.`
      );
      return;
    }
    
    cart.push({
      producto: product,
      cantidad: cantidad,
      subtotal: product.precio * cantidad
    });
  }

  saveCartByEmail(userEmail, cart);
};


//FUNCIONES AUXILIARES 

// Función auxiliar para saber cuánto va sumando el total
export async function getCartTotal(userEmail: string): Promise<number> {
  const cart = await getCartByEmail(userEmail);
  return cart.reduce((acc, item) => acc + item.subtotal, 0);
}

// Función auxiliar para saber cuánto va sumando el total
export async function getCartQuantity(userEmail: string): Promise<number> {
  const cart = await getCartByEmail(userEmail);
  return cart.reduce((acc, item) => acc + item.cantidad, 0);
}

// Modificar la cantidad exacta de un ítem (ej. desde un input en la vista del carrito)
export async function updateCartItemQuantity(productId: number, nuevaCantidad: number, userEmail: string): Promise<void> {
  let cart = await getCartByEmail(userEmail);
  const itemIndex = cart.findIndex(item => item.producto.id === productId);


  if (itemIndex !== -1) {
    if (nuevaCantidad <= 0) {
      removeFromCart(userEmail, cart[itemIndex].producto.id)
    } else {
      cart[itemIndex].cantidad = nuevaCantidad;
      cart[itemIndex].subtotal = nuevaCantidad * cart[itemIndex].producto.precio;
    }
    saveCartByEmail(userEmail, cart);
  }
}
