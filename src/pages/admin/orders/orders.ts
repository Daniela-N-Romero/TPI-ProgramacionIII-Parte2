import { checkAuthUser } from "../../../utils/auth";

const initPage = () => {
  const isAuthorized = checkAuthUser("ADMIN", "/src/pages/store/home/storeHome.html");
  if (isAuthorized) {
    const body = document.getElementById("content-body");
    if (body) body.style.display = "block";
  }
};
initPage();
 
  