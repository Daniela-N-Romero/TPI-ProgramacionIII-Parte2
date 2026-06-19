import { checkAuthUser, logout } from "../../../utils/auth";

const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});


const initPage = () => {
  const isAuthorized = checkAuthUser("ADMIN", "/src/pages/store/home/storeHome.html");

  if (isAuthorized) {
    const body = document.getElementById("content-body");
    if (body) body.style.display = "block";
  }

};
initPage();
 
  