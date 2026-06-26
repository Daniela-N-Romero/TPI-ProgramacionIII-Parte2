import type { IProduct } from "../../types/IProduct";
import { getElementById, removeElementById, saveOrUpdate, getElementsFromStorage } from "./storageBase"


//Funciones para traer, modificar, crear y eliminar datos del storage
//(para no modificar JSON original como se solicito en consigna TPI)
export const getProduct = async (id: number) => await getElementById<IProduct>(id,"products");
export const getProducts = async () => await getElementsFromStorage<IProduct>("products");
export const removeProduct = async (id: number) => await removeElementById(id, "products")
export const saveOrUpdateProduct = async (product: IProduct)  => await saveOrUpdate(product ,"products")
