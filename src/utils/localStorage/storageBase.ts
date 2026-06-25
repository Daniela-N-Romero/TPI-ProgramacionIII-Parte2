// Los datos se traen desde los JSON y se guardan en memoria (session storage) o local storage segùn lo solicitado por la catedra
import { fetchProducts, fetchCategories, fetchOrders, fetchUsers } from "../fetch";

// --------------------------
// FUNCIONES SINCRONAS
// --------------------------

// Función auxiliar para determinar dónde guardar cada tipo de dato
const determinarStorage = (key: string): Storage => {
  // Las sesiones, los carritos y los PEDIDOS van al localStorage real (Persistente)
  if (
    key === "userData" || 
    key.startsWith("cart_") || 
    (key.startsWith("orders_") && key !== "orders")
  ) {
    return localStorage;
  }
  
  // Todo lo demás (products, categories, users y la key general de pedidos ("orders") del Admin) va a sessionStorage. Trabaja entre páginas HTML de Vite, pero muere con F5.
  return sessionStorage;
};

// Traer elemento
export const getElement = (storageItem: string) => {
  const storage = determinarStorage(storageItem);
  const element = storage.getItem(storageItem);
  return element ? JSON.parse(element) : null;
};

// Eliminar elemento
export const removeElement = (storageItem: string) => {
  const storage = determinarStorage(storageItem);
  storage.removeItem(storageItem);
};

// Guardar un array en el Storage correspondiente
export const saveArray = <T>(array: T[], storageItem: string): void => {
  const storage = determinarStorage(storageItem);
  storage.setItem(storageItem, JSON.stringify(array));
};

// --------------------------
// FUNCIONES ASINCRONAS
// --------------------------

// Esto asegura que no importa en qué página estés, si se necesitan los datos, se van a buscar.
const verificarFetchSemilla = async (storageItem: string): Promise<void> => {
  const storage = determinarStorage(storageItem);
  // Si ya tiene datos guardados en su storage correspondiente, no hacemos nada
  if (storage.getItem(storageItem)) return;

  try {
    let data: any[] = [];
    if (storageItem === "products") data = await fetchProducts();
    if (storageItem === "categories") data = await fetchCategories();
    if (storageItem === "orders") data = await fetchOrders();
    if (storageItem === "users") data = await fetchUsers();

    if (data.length > 0) {
      storage.setItem(storageItem, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Error en la auto-importación de ${storageItem}:`, error);
  }
};


// Traer array de elementos
export const getElementsFromStorage = async <T>(storageItem: string): Promise<T[]> => {
  await verificarFetchSemilla(storageItem);
  const storage = determinarStorage(storageItem);
  const array = storage.getItem(storageItem);
  return array ? JSON.parse(array) : [];
};


// Traer un elemento por ID
export const getElementById = async <T extends { id: number }>(id: number, storageItem: string): Promise<T | null> => {
  const array = await getElementsFromStorage<T>(storageItem);
  const element = array.find(item => item.id === id);
  return element || null;
};

// Eliminar un elemento por ID
export const removeElementById = async <T extends { id: number }>(id: number, storageItem: string): Promise<void> => {
  const array = await getElementsFromStorage<T>(storageItem);
  const arrayFiltrado = array.filter(item => item.id != id);
  saveArray(arrayFiltrado, storageItem); 
};

// Guardar cambios o crear un nuevo elemento
export const saveOrUpdate = async <T extends { id: number }>(element: T, storageItem: string): Promise<void> => {
  const array = await getElementsFromStorage<T>(storageItem);
  const index = array.findIndex(item => item.id === element.id);
  
  if (index !== -1) {
    array[index] = element;
  } else {
    element.id = array.length > 0 ? Math.max(...array.map(c => c.id)) + 1 : 1;
    array.push(element);
  }
  saveArray(array, storageItem);
};
