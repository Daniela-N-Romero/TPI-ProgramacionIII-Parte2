import type { IUserDTO, IUserStorage} from "../../types/IUser";
import { getElement, removeElement, saveOrUpdate, getElementsFromStorage } from "./storageBase"


//Funciones para traer, modificar, crear y eliminar datos del storage
//(para no modificar JSON original como se solicito en consigna TPI)

export const getUsers = async () => await getElementsFromStorage<IUserStorage>("users");
export const removeActiveUser = () => removeElement("userData");
export const saveOrUpdateUser = async (user: IUserStorage)  => await saveOrUpdate(user ,"users")

//funciones para acceder y modificar la sesion activa de usuario: trateremos a la autenticacion así por motivos pedagogicos 
export const getActiveUser = () => getElement("userData");
export const loginUser = (user: IUserDTO) => {
  const parseUser = JSON.stringify(user);
  localStorage.setItem("userData", parseUser);
};
