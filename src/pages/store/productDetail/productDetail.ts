import { validarAccesoRuta, obtenerEstadoCliente, navigate } from "../../../../src/utils/guards/guards";
import { getProduct } from "../../../utils/storage/productStorage";
import { addToCart } from "../../../utils/storage/cartStorage";
import { getActiveUser } from "../../../utils/storage/userStorage";
import { actualizarBadgeNavbar } from "../../../utils/layout";
import { AlertService } from "../../../utils/modals/alert";

// Ejecutamos la lógica principal si la ruta está permitida

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get("id");

    if (!productoId) {
        console.error("No se proporcionó ningún ID de producto.");
        navigate("/tienda");
    }
});

const main = document.getElementById("main-view");

main?.classList.add("main-content-block")
if (validarAccesoRuta()) {
    renderProductDetail();
    await actualizarBadgeNavbar();
}

async function renderProductDetail(): Promise<void> {
    const mainView = document.getElementById("main-view");
    if (!mainView) return;

    // 1. Capturamos el ID desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = Number(urlParams.get("id"));

    if (!productoId) {
        mainView.innerHTML = `<p class="error-msg">Producto no especificado. <a href="/tienda">Volver a la tienda</a></p>`;
        return;
    }

    // 2. Buscamos el producto real en el localStorage
    const producto = await getProduct(productoId);

    if (!producto) {
        mainView.innerHTML = `<p class="error-msg">El producto solicitado no existe. <a href="/tienda">Volver a la tienda</a></p>`;
        return;
    }

    // 3. Verificamos el rol del usuario actual
    const { isAdmin, isInvitado } = obtenerEstadoCliente();

    // 4. Inyectamos la estructura de dos columnas solicitada en el diseño
    mainView.innerHTML = `
        <div class="detail-container">
            <div class="detail-image-side">
                <img src="${producto.imagen || 'https://via.placeholder.com/500'}" alt="${producto.nombre}" class="detail-img">
            </div>
            <div class="detail-info-side">
                <span class="detail-category">${producto.categoria?.nombre || 'Categoría'}</span>
                <h2 class="detail-title">${producto.nombre}</h2>
                <p class="detail-description">${producto.descripcion}</p>
                
                <div class="detail-meta">
                    <span class="detail-price">$${producto.precio}</span>
                    <span class="detail-stock">Stock disponible: <strong>${producto.stock}</strong></span>
                </div>

                <div class="detail-actions-box ${isAdmin ? 'hidden' : ''}">
                    <div class="quantity-selector">
                        <button type="button" class="qty-btn" id="btn-minus">-</button>
                        <input type="number" id="input-quantity" value="1" min="1" max="${producto.stock}" readonly>
                        <button type="button" class="qty-btn" id="btn-plus">+</button>
                    </div>
                    <button class="btn btn-primary btn-add-detail" id="btn-add-to-cart" data-id="${producto.id}">
                        Agregar al carrito 🛒
                    </button>
                </div>

                ${isAdmin ? '<p class="admin-warning-text">⚠️ Modo Administrador: La simulación de compra está deshabilitada.</p>' : ''}
                
                <button class="btn-back-store" id="btn-back">Volver a la Tienda</button>
            </div>
        </div>
    `;

    // 5. Activamos los listeners de la interfaz
    configurarComponentesDetalle(producto.stock, isInvitado);
}

function configurarComponentesDetalle(maxStock: number, isInvitado: boolean): void {
    const btnMinus = document.getElementById("btn-minus");
    const btnPlus = document.getElementById("btn-plus");
    const inputQty = document.getElementById("input-quantity") as HTMLInputElement;
    const btnAdd = document.getElementById("btn-add-to-cart");
    const btnBack = document.getElementById("btn-back");

    // Botón Volver
    btnBack?.addEventListener("click", () => navigate("/tienda"));

    if (!inputQty) return;

    // Manejo del contador de cantidad
    btnMinus?.addEventListener("click", () => {
        let current = Number(inputQty.value);
        if (current > 1) {
            inputQty.value = (current - 1).toString();
        }
    });

    btnPlus?.addEventListener("click", () => {
        let current = Number(inputQty.value);
        if (current < maxStock) {
            inputQty.value = (current + 1).toString();
        }
    });

    // Acción de agregar al carrito
    btnAdd?.addEventListener("click", async(e) => {
        if (isInvitado) {
            e.stopImmediatePropagation();
            alert("Debés iniciar sesión para añadir productos al carrito.");
            navigate("/login");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const productoId = Number(urlParams.get("id"));
        const producto = await getProduct(productoId);
        const cantidadAAgregar = Number(inputQty.value);

        if (producto) {
            const user = getActiveUser();
            await addToCart(producto, cantidadAAgregar, user.mail);
            await actualizarBadgeNavbar();
            
            AlertService.success(`${producto.nombre} al carrito con éxito!`, `¡Se agregaron ${cantidadAAgregar} x ${producto.nombre}`)
        }
    });
}
