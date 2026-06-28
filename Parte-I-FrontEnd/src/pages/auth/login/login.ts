import type { Rol, IUserDTO } from "../../../types/IUser";
import { findUserByEmail, rolRedirect, validateEmail, validatePassword } from "../../../utils/auth/auth";
import { AlertService } from "../../../utils/modals/alert";
import { loginUser } from "../../../utils/storage/userStorage";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;


form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

 if(!validateEmail(valueEmail)){
    AlertService.warning(
          "Error en el correo electrónico.", 
          "Por favor, ingrese un correo electrónico válido."
        );
    return;
 }
 if(!validatePassword(valuePassword)){
    AlertService.warning(
          "Error en el correo electrónico.", 
          "La contraseña no cumple con los requisitos."
        );
    return;
 }
  const usuarioExistente = await findUserByEmail(valueEmail);
  
  if (!usuarioExistente) {
        AlertService.warning(
          "Error en el correo electrónico.", 
          "El email ingresado no existe."
        );
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
    AlertService.warning(
          "Error", 
          "Contraseña incorrecta. Por favor, intenta de nuevo."
        );
      inputPassword.value = "";
  }
});