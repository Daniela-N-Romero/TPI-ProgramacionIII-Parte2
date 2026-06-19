import type { IUser} from "../types/IUser";
import type { IUserStorage} from "../types/IUserStorage";


//funciones para acceder y modificar la sesion activa de usuario,
//se mantienen porque no se especifica en el TPI que no trateremos a la autenticacion así
//por motivos pedagogicos 
export const loginUser = (user: IUser) => {
  const parseUser = JSON.stringify(user);
  localStorage.setItem("userData", parseUser);
};
export const getUser = () => {
  return localStorage.getItem("userData");
};
export const removeUser = () => {
  localStorage.removeItem("userData");
};

//funciones de localStorage que se mantienen para guardar usuarios nuevos, 
//ya que el TPI especifica que no deben guardarse en el json.

export const getUsers = (): IUserStorage[] => {
    const users = localStorage.getItem("users")
    return users? JSON.parse(users) : [] 
}

export const saveUser = (user: IUserStorage) => {
  const users = getUsers();
  users.push(user)
  localStorage.setItem("users", JSON.stringify(users));
};
