import { checkAuthUser } from "../../../utils/auth/auth";

const initPage = () => {
  const isAuthorized = checkAuthUser("ADMIN", "/tienda");

  if (isAuthorized) {
    console.log("el usuario esta autorizado y es ADMIN")
    const main = document.querySelector(".main-content") as HTMLElement;
    if (main) main.style.display = "block";
  }

};
initPage();
 
  