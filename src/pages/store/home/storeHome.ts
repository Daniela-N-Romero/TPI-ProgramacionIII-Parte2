import { validarAccesoRuta, obtenerEstadoCliente, navigate } from "../../../../src/utils/guards/guards";
import { agregarAlCarrito } from "../../../../src/utils/localStorage/cartStorage"

if (validarAccesoRuta()) { //si tiene acceso permitido a la ruta...
  const { isInvitado, isAdmin } = obtenerEstadoCliente();
  const btnAgregar = document.getElementById("btn-agregar-carrito") as HTMLButtonElement;

  if (btnAgregar) {
    if (isAdmin) {
      btnAgregar.disabled = true;
      btnAgregar.classList += "disabled";
    } else if (isInvitado) {
      btnAgregar.addEventListener("click", () => {
        navigate("/login.html");
      });
    } else {
      // Flujo normal de usuario logueado
      btnAgregar.addEventListener("click", () => agregarAlCarrito(productoId));
    }
  }
}