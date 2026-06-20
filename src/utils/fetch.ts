import type { IUserStorage } from "../types/IUser";
import type { IProduct } from "../types/IProduct";
import type { ICategory } from "../types/ICategory";
import type { IOrder } from "../types/IOrder";


// funcion base que recibe el url del json, el mensaje de error, y retorna una promesa de cualquier tipo generico que se indica al llamar a la funcion
const fetchFunction = async <T>(url: string, errorMessage: string): Promise<T>=>{
    try{
    const response = await fetch(url)
    if (!response.ok){
      throw new Error(errorMessage);
    }
    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}


export async function getUsers(): Promise<IUserStorage[]>{
    return await fetchFunction<IUserStorage[]>("/data/usuarios.json", "Error al buscar los usuarios.")
}

export async function getProducts(): Promise<IProduct[]> {
  return await fetchFunction<IProduct[]>("/data/productos.json", "Error al buscar los productos.");
}

export async function getCategories(): Promise<ICategory[]> {
  return await fetchFunction<ICategory[]>("/data/categorias.json", "Error al buscar las categorías.");
}

export async function getOrders(): Promise<IOrder[]> {
  return await fetchFunction<IOrder[]>("/data/pedidos.json", "Error al buscar los pedidos.");
}



