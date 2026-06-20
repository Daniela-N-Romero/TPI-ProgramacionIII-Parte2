import { getUser } from "./localStorage/userStorage";
import { logout } from "./auth/auth";

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

const user = getUser();

const renderNavbar = () => {
    const navContainer = document.getElementById('nav-links') as HTMLElement;

    if (user?.rol === "ADMIN") {
        navContainer.innerHTML = `
                <li><a href="${links.storeHome}" id="nav-store">Tienda</a></li>
                <li><a href="${links.adminHome}" id="nav-admin" class="active">Panel Admin</a></li>
                <li class="user-name">${user.name}</li>
                <li><button class="btn btn-secondary" id="btn-logout">Cerrar Sesión</button></li>
            `;

    } else if (user?.rol === "USUARIO") {
        navContainer.innerHTML = `
                <li><a href="${links.storeHome}" class="active">Inicio</a></li>
                <li><a href="${links.clientOrders}">Mis Pedidos</a></li>
                <li><a href="${links.cart}" class="cart-icon">🛒 Carrito <span class="badge">1</span></a></li>
                <li class="user-name">${user.name}</li>
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

const renderSidebar = () => {
    const appSidebar = document.getElementById('app-sidebar') as HTMLElement;
    
    if (user?.rol === "ADMIN") {
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

    } else {
        // Si no hay usuario o el rol es de invitado, se asume invitado
        appSidebar.innerHTML = `
            <h3 class="sidebar-title">Categorías</h3>
            <h4 class="sidebar-subtitle">Filtra por categoria</h4>
            <ul class="sidebar-menu">
                <li class="active"><a href="#">📦 Todos los productos</a></li>
                <li><a href="#">🍔 Hamburguesas</a></li>
                <li><a href="#">🍕 Pizzas</a></li>
                <li><a href="#">🥟 Empanadas</a></li>
                <li><a href="#">🍟 Papas Fritas</a></li>             
            </ul>
            `;
    }


}

const renderLayout = () => {
    renderNavbar();
    renderSidebar();
}

renderLayout();