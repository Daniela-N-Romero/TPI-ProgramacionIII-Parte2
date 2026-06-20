import type { Rol, IUserDTO } from "../../../types/IUser";
import { findUserByEmail, rolRedirect, validateEmail, validatePassword } from "../../../utils/auth/auth";
import { loginUser } from "../../../utils/localStorage/userStorage";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;


form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

    console.log(valueEmail, valuePassword)

 if(!validateEmail(valueEmail)){
    alert("Por favor, ingrese un correo electrónico válido.");
    return;
 }
 if(!validatePassword(valuePassword)){
    alert("La contraseña no cumple con los requisitos.");
    return;
 }
  const usuarioExistente = await findUserByEmail(valueEmail);
  
  if (!usuarioExistente) {
      alert("El email ingresado no existe.")
      inputPassword.value = "";
      return; 
  }

  if (usuarioExistente.password === valuePassword) {
      const user: IUserDTO = {
        id: usuarioExistente.id,
        mail: usuarioExistente.mail,
        nombre: usuarioExistente.nombre,
        apellido: usuarioExistente.apellido,
        celular: usuarioExistente.celular,
        rol: usuarioExistente.rol as Rol,
        loggedIn: true,
      };

      loginUser(user);
      rolRedirect(user.rol, "/adminPanel", "/tienda");
  } else {
      alert("Contraseña incorrecta. Por favor, intenta de nuevo.");
      inputPassword.value = "";
  }
});