import type { ICategory } from "../../types/ICategory";
import { getElementsFromStorage, removeElementById, saveOrUpdate } from "./storageBase"

//Funciones para traer, modificar, crear y eliminar datos del storage
//(para no modificar JSON original como se solicito en consigna TPI)
export const getCategories = () => getElementsFromStorage<ICategory>("categories");
export const removeCategory = (id: number) => removeElementById(id, "categories")
export const saveOrUpdateCategory = (category: ICategory) => saveOrUpdate(category, "categories")

