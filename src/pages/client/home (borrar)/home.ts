import { checkAuthUser, logout } from "../../../utils/auth";


const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});

const initPage = () => {
  console.log("inicio de pagina");
  const isAuthorized = checkAuthUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/admin/adminHome/home.html",
    "USUARIO"
  );
// Evitamos que el body se muestre si el rol no es el adecuado.
if (isAuthorized) {
    const body = document.getElementById("content-body");
    if (body) body.style.display = "block";
  }
};
initPage();
