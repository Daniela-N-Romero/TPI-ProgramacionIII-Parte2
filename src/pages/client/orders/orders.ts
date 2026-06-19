import { checkAuthUser } from "../../../utils/auth";

const initPage = () => {
  const isAuthorized = checkAuthUser("USUARIO", "/src/pages/auth/login/login.html");
  if (isAuthorized) {
    const body = document.getElementById("content-body");
    if (body) body.style.display = "block";
  }
};
initPage();
 
  