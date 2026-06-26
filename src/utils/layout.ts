import { getCategories } from "./storage/categoryStorage";
import { getCartByEmail } from "./storage/cartStorage";
import { logout } from "./auth/auth";
import { obtenerEstadoCliente } from "./guards/guards";
import { getActiveUser } from "./storage/userStorage";

const user = obtenerEstadoCliente();

const renderNavbar = () => {
    const navContainer = document.getElementById('nav-links') as HTMLElement;
    const links = {
        index: "/index.html",
        login: "/login",
        registro: "/registro",
        adminHome: "/adminPanel",
        categories: "/manageCategories",
        products: "/manageProducts",
        orders: "/manageOrders",
        storeHome: "/tienda",
        cart: "/carrito",
        productDetail: "/producto",
        clientOrders: "/pedidos"
    }
    
    
    if (user.isAdmin) {
        navContainer.innerHTML = `
                <li><a href="${links.storeHome}" id="nav-store">Tienda</a></li>
                <li><a href="${links.adminHome}" id="nav-admin" class="active">Panel Admin</a></li>
                <li class="user-name">${user.usuarioNombre}</li>
                <li><button class="btn btn-secondary" id="btn-logout">Cerrar Sesión</button></li>
            `;

    } else if (user.isUsuario) {
        navContainer.innerHTML = `
                <li><a href="${links.storeHome}" class="active">Inicio</a></li>
                <li><a href="${links.clientOrders}">Mis Pedidos</a></li>
                <li><a href="${links.cart}" class="cart-icon">🛒 Carrito <span class="badge">1</span></a></li>
                <li class="user-name">${user.usuarioNombre}</li>
                <li><button class="btn btn-secondary" id="btn-logout">Cerrar Sesión</button></li>
                ;`
    } else {
        // Si no hay usuario o el rol no es reconocido, se asume invitado
        navContainer.innerHTML = `
                <li><a href="${links.login}" class="btn btn-secondary" id="btn-login">Iniciar Sesión</a></li>
                <li><a href="${links.registro}" class="btn btn-primary" id="btn-register">Registrarse</a></li>
            `;
    }

    const btnLogout = document.getElementById("btn-logout");
    btnLogout?.addEventListener("click", ()=> logout())
}

const renderSidebar = async () => {
    const appSidebar = document.getElementById('app-sidebar') as HTMLElement;
    if (appSidebar){
    if (user.isUsuario || user.isInvitado || window.location.pathname === "/tienda") {
    
            const categorias = await  getCategories();
    
            const categoriasHtml = categorias
                .map(cat => `<li><a href="#" data-categoria-id="${cat.id}">${cat.nombre}</a></li>`)
                .join("");
    
            appSidebar.innerHTML = `
                <h3 class="sidebar-title">Categorías</h3>
                <h4 class="sidebar-subtitle">Filtra por categoría</h4>
                <ul class="sidebar-menu">
                    <li class="active"><a href="#" data-categoria-id="todas">📦 Todos los productos</a></li>
                    ${categoriasHtml}            
                </ul>
                `;

        } else if (user.isAdmin && window.location.pathname !== "/tienda") {
        appSidebar.innerHTML = `
            <h3 class="sidebar-title">Administracíon</h3>
            <h4 class="sidebar-subtitle">Panel de control</h4>
            <ul class="sidebar-menu">
                <li class="active"><a href="/adminPanel">Dashboard</a></li>
                <li><a href="/manageCategories">Categorias</a></li>
                <li><a href="/manageProducts">Productos</a></li>
                <li><a href="/manageOrders">Pedidos</a></li>
                <hr class="sidebar-divider">
                <li><a href="/tienda">Ver Tienda</a></li>
            </ul>
            `;
            
        }  
}
}

export const actualizarBadgeNavbar = async (): Promise<void> => {
  const badge = document.querySelector('#nav-links .badge') as HTMLElement;
  if (!badge) return;
  const user = getActiveUser(); 
  const cart = await getCartByEmail(user.mail);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  badge.innerText = totalItems.toString();
};


const renderLayout = () => {
    renderNavbar();
    renderSidebar();
    actualizarBadgeNavbar();
}

renderLayout();