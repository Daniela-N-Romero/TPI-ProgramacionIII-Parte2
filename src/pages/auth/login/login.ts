import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { findUserByEmail, rolRedirect, validateEmail, validatePassword } from "../../../utils/auth";
import { loginUser } from "../../../utils/localStorage";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;


form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

 if(!validateEmail(valueEmail)){
    alert("Por favor, ingrese un correo electrónico válido.");
    return;
 }
 if(!validatePassword(valuePassword)){
    alert("La contraseña no cumple con los requisitos.");
    return;
 }
  const usuarioExistente = await findUserByEmail(valueEmail);
  console.log("Usuario encontrado:", usuarioExistente);
  if (!usuarioExistente) {
      alert("El email ingresado no existe.")
      inputPassword.value = "";
      return; 
  }

  if (usuarioExistente.password === valuePassword) {
      const user: IUser = {
        mail: usuarioExistente.mail,
        rol: usuarioExistente.rol as Rol,
        loggedIn: true,
      };

      loginUser(user);
      rolRedirect(user.rol, "/src/pages/admin/adminHome/home.html", "/src/pages/store/home/storeHome.html");
  } else {
      alert("Contraseña incorrecta. Por favor, intenta de nuevo.");
      inputPassword.value = "";
  }
});