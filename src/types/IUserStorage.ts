import type { IUser } from "./IUser";

export interface IUserStorage extends IUser {
  id: string;
  password: string;
  // nombre: string;
  // apellido: string;
  // celular: string;
}