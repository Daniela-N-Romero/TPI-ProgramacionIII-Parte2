import { getActiveUser } from "./utils/storage/userStorage.ts"
import { rolRedirect  } from "./utils/auth/auth.ts";
import {navigate} from "./utils/guards/guards.ts"

//LISTA DE TO DO 

// -verificar comentarios
// -verificar estilos y estilos en linea
// -completar el ReadME. urgente
// -hacer pruebas

document.addEventListener('DOMContentLoaded', () => {
    
 
    const user = getActiveUser();
    if (user)  {
        rolRedirect(user.rol, "/adminPanel", "/tienda");
    }
       
    const loginBtn = document.getElementById('btn-landing-login') as HTMLElement;
    loginBtn.addEventListener('click', ()=> navigate("/login"))
    const guestBtn = document.getElementById('btn-landing-guest') as HTMLElement;
    guestBtn.addEventListener('click', ()=> navigate("/tienda"))


});







