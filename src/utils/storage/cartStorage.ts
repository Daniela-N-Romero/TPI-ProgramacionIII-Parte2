import type { IProduct } from '../../types/IProduct';
import type { ICartItem } from '../../types/ICart'
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

// Agregar al carito desde la tienda (o actualizar cantidad si ya existe) - TO DO: respetar el stock disponible 
export async function addToCart(product: IProduct, cantidad: number = 1, userEmail: string): Promise<void> {
  const cart = await getCartByEmail(userEmail);
  const itemIndex = cart.findIndex(item => item.producto.id === product.id);

  if (itemIndex !== -1) {                       // Si ya existe, sumamos la cantidad 
    cart[itemIndex].cantidad += cantidad;
    cart[itemIndex].subtotal = cart[itemIndex].cantidad * cart[itemIndex].producto.precio;
  } else {                                      // Si es nuevo, lo agregamos
    cart.push({
      producto: product,
      cantidad: cantidad,
      subtotal: product.precio * cantidad
    });
  }

  saveCartByEmail(userEmail, cart);
}


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
  // console.log(cart[itemIndex].producto.id, " es el id del producto en el carrito. Y el indice en el carrito es ", itemIndex)


  if (itemIndex !== -1) {
    if (nuevaCantidad <= 0) {
      // Si la cantidad pasa a ser 0 o menos, lo eliminamos automáticamente
      cart = cart.filter(item => item.producto.id !== productId);
    } else {
      cart[itemIndex].cantidad = nuevaCantidad;
      cart[itemIndex].subtotal = nuevaCantidad * cart[itemIndex].producto.precio;
    }
    saveCartByEmail(userEmail, cart);
  }
}
