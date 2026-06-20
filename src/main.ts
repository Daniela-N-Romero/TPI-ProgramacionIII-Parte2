import { getUser } from "./utils/localStorage/userStorage.ts"
import { rolRedirect  } from "./utils/auth/auth.ts";
import {navigate} from "./utils/navigate.ts"

document.addEventListener('DOMContentLoaded', () => {

    const user = getUser();
    if (user)  {
        rolRedirect(user.rol, "/adminPanel", "/tienda");
    }
       
    const loginBtn = document.getElementById('btn-landing-login') as HTMLElement;
    loginBtn.addEventListener('click', ()=> navigate("/login"))
    const guestBtn = document.getElementById('btn-landing-guest') as HTMLElement;
    guestBtn.addEventListener('click', ()=> navigate("/tienda"))
});







