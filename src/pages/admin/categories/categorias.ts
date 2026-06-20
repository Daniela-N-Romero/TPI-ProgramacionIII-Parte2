import { checkAuthUser } from "../../../utils/auth/auth";

const initPage = () => {
  const isAuthorized = checkAuthUser("ADMIN", "/tienda");
  if (isAuthorized) {
    const body = document.getElementById("content-body");
    if (body) body.style.display = "block";
  }
};
initPage();
 
  