import type { IUser } from "../types/IUser";
import type { IUserStorage } from "../types/IUserStorage";
import type { Rol } from "../types/Rol";
import { getUser, removeUser } from "./localStorage";
import { navigate } from "./navigate";


//funcion que busca un usuario por mail
export async function findUserByEmail(email:string): Promise<IUserStorage | null> {
    try{        
        const users = await getUsers();
        const user = users.find(u => u.mail === email) || null;
        return user;
    }catch(error){
       console.error("Error al buscar el usuario:", error);
       throw error;
    }
}

//funcion para recuperar a los usuarios desde el json, pero se va a modificar luego para recuperar desde la API
export async function getUsers(): Promise<IUserStorage[]> {
  try{
    const response = await fetch("/data/usuarios.json")
    if (!response.ok){
      throw new Error("Error al obtener los usuarios");
    }
    const users: IUserStorage[] = await response.json();
    return users;
  } catch (error) {
    console.error("Error al buscar el usuario:", error);
    throw error;
  }
};

//revisar si hay un usuario activo, si no lo hay redirigir a login, si lo hay verificar el rol
export const checkAuthUser = (
  rol: Rol, // el rol que debe tener para estar autorizado a ver la pagina
  redireccion: string, // ruta a la que se redirige si el usuario no tiene el rol requerido
) => {

  const user = getUser();
    
  if (!user) { // no hay usuario activo
    navigate("/src/pages/auth/login/login.html");
    return false;
  } else if (JSON.parse(user).rol !== rol) { // el usuario no tiene el rol requerido
    navigate(redireccion);    
  }
  return true;
};


//eliminar sesion activa y redirigir al login
export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};

//redirigir segun el rol del usuario
export const rolRedirect = (rol: string, adminPath:string, userPath:string)=>{
  if (rol === "ADMIN") {
    navigate(adminPath);
  } else if (rol === "USUARIO") {
    navigate(userPath);
  }

}


// validaciones

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/;
  return passwordRegex.test(password);
};
