
import type { Rol, IUserStorage } from "../../types/IUser";
import { getUser, removeUser } from "../localStorage/userStorage";
import { getUsers } from "../fetch"
import { navigate } from "../guards/guards"


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

//eliminar sesion activa y redirigir a la tienda en modo invitado
export const logout = () => {
  removeUser();
  navigate("/tienda");
};


// validaciones
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/;
  return passwordRegex.test(password);
};
  





  //redirigir segun el rol del usuario
  export const rolRedirect = (rol: string, adminPath:string, userPath:string)=>{
    if (rol === "ADMIN") {
      navigate(adminPath);
    } else if (rol === "USUARIO") {
      navigate(userPath);
    }
    
  }
  
  
  //revisar si hay un usuario activo, si no lo hay redirigir a login, si lo hay verificar el rol
  export const checkAuthUser = (
    rol: Rol, // el rol que debe tener para estar autorizado a ver la pagina
    redireccion: string, // ruta a la que se redirige si el usuario no tiene el rol requerido
  ) => {
  
    const user = getUser();
      
    if (!user) { // no hay usuario activo
      navigate("/login");
      return false;
    } else if (user.rol !== rol) { // el usuario no tiene el rol requerido
      navigate(redireccion);    
    }
    return true;
  };
