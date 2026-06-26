// src/auth/guards.ts
import { getActiveUser } from '../storage/userStorage'; 

type Rol = "ADMIN" | "USUARIO";
type TipoUsuario = Rol | "INVITADO";

// Definimos qué páginas tiene permitido cargar cada rol
const MAPA_ACCESO_PAGINAS: Record<TipoUsuario, string[]> = {
    ADMIN: ["/inicio", "/adminPanel", "/pedidos", "/tienda", "/producto"],
    USUARIO: ["/inicio", "/tienda", "/producto", "/pedidos", "/carrito"],
    INVITADO: ["/inicio", "/tienda", "/login", "/registro"]
};

export const navigate = (route: string) => {
  window.location.href = route;
};

//ffuncion usada cuando se accede a cualquier pagina
export const validarAccesoRuta = () => {
  const user = getActiveUser();
  // Si no hay usuario y tiene loggedIn, o no existe, es INVITADO
  const rolActual: TipoUsuario = (user && user.loggedIn) ? user.rol : "INVITADO";
  
  // Obtenemos el archivo HTML actual 
  const pathnameActual = window.location.pathname;

  // Validamos si el rol actual tiene permiso para ver esta página
  const paginasPermitidas = MAPA_ACCESO_PAGINAS[rolActual];
  const tieneAcceso = paginasPermitidas.some(pagina => pathnameActual.includes(pagina));

  if (!tieneAcceso) {
    // Redirecciones 
    console.log(rolActual)
    if (rolActual === "INVITADO") {
      navigate("/login");
    } else if (rolActual === "ADMIN") {
      navigate("/adminPanel");
    } else {
      navigate("/tienda");
    }
    return false;
  }

  // Si tiene acceso, mostramos el body que por defecto debería estar oculto en CSS
  document.body.style.display = "block";
  return true;
};

export const obtenerEstadoCliente = () => {
  const user = getActiveUser();
  return {
    isAdmin: user?.loggedIn && user.rol === "ADMIN",
    isUsuario: user?.loggedIn && user.rol === "USUARIO",
    isInvitado: !user || !user.loggedIn,
    usuarioId: user?.id || null,
    usuarioNombre: user?.nombre || null
  };
};