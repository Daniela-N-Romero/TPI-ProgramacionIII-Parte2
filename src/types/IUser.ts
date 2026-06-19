import type { Rol } from "./Rol";

export interface IUser {
  mail: string;
  loggedIn: boolean;
  rol: Rol;
}
