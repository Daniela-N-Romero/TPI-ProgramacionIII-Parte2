export type Rol = "ADMIN" | "USUARIO";

//Datos base que vienen de pedidos.json
export interface IBaseUser {
    id: number; 
    nombre: string;
    apellido: string;
    mail: string;
    celular: string;
    rol: Rol;
}

// para manejar la sesión activa 
export interface IUserDTO extends IBaseUser {
    loggedIn: boolean; 
}

// Datos completos que vienen del usuarios.json
export interface IUserStorage extends IBaseUser {
    password: string;
}