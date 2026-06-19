import type { IUser } from "./types/IUser.ts";
import { getUser } from "./utils/localStorage.ts"
import { rolRedirect , logout } from "./utils/auth.ts";


const greeting = document.getElementById("user-email")
const sessionNotice = document.getElementById("session-notice")
const guestSession = document.getElementById("guest-section")
const btnContinue = document.getElementById("btn-continue")
const btnLogout = document.getElementById("btn-logout")



document.addEventListener('DOMContentLoaded', () => {

    const user = getUser();
    console.log("Usuario en sesión:", user);
    if (user)  {
        const parsedUser: IUser = JSON.parse(user);
        displaySessionNotice(true, parsedUser.mail );
       
        btnContinue?.addEventListener("click", ()=>{
            rolRedirect(parsedUser.rol, "/src/pages/admin/adminHome/home.html", "/src/pages/store/home/storeHome.html");
        })
         btnLogout?.addEventListener("click", ()=>{
            logout();
        })
    } 
    else{displaySessionNotice(false);}

    

});

const displaySessionNotice = (flag:boolean, email?:string) =>{
    if (flag)  {
        if (sessionNotice && greeting) {
            sessionNotice.style.display = "block";
            email? greeting.innerHTML= email : ''}          
    } 
    else {
        if (guestSession) guestSession.style.display = "block";
    }
};






