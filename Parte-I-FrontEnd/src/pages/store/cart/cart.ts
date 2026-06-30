import { ModalService } from "../../../utils/modals/modal";
import type { FormaPago, IOrder } from "../../../types/IOrder";
import { clearCart, removeFromCart, getCartTotal, updateCartItemQuantity, getCartByEmail } from "../../../utils/storage/cartStorage";
import { getActiveUser } from "../../../utils/storage/userStorage";
import { getOrders, getOrdersByEmail, registrarNuevoPedidoDelCliente } from "../../../utils/storage/orderStorage";
import { AlertService } from "../../../utils/modals/alert";
import { actualizarBadgeNavbar } from "../../../utils/layout";
import { getProduct, saveOrUpdateProduct } from "../../../utils/storage/productStorage";

// Envío (Documentado en README)
const COSTO_ENVIO = 500;

//Al cargar la página se inicia el servicio de modales y se si el usuario tiene permiso se renderiza el main.
document.addEventListener("DOMContentLoaded", () => {
    ModalService.init();
    const user = getActiveUser();
    const main = document.querySelector(".main-content");
    if (user.rol === "USUARIO") {
        main?.classList.add("main-content-block")
        renderizarCarrito(user.mail);
    }
});

// Renderizado de carrito
const renderizarCarrito = async (email: string): Promise<void> => {
    const container = document.getElementById("cart-content-wrapper")!;
    const cart = await getCartByEmail(email);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-container">
                <p>Tu carrito de compras está vacío.</p>
                <button class="btn btn-primary" onclick="window.location.href='/tienda'">Ir a la Tienda</button>
            </div>
        `;
        await actualizarBadgeNavbar();
        return;
    }

    const itemsContainer = document.getElementById("cart-items-container")!;
    itemsContainer.innerHTML = "";

    cart.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.className = "cart-item-card";
        itemCard.innerHTML = `
            <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.producto.nombre}</h3>
                <p class="cart-item-desc">${item.producto.descripcion}</p>
                <p class="cart-item-desc"> Stock actual: ${item.producto.stock} unidades.</p>
                <span class="cart-item-price">$${item.producto.precio.toFixed(2)} c/u</span>
            </div>
            <div class="cart-qty-actions">
                <button class="btn-qty btn-minus" data-id="${item.producto.id}">-</button>
                <span class="qty-value-${item.producto.id}">${item.cantidad}</span>
                <button class="btn-qty btn-plus" data-id="${item.producto.id}">+</button>
            </div>
            <div class="cart-item-subtotal">$${item.subtotal.toFixed(2)}</div>
            <button class="btn-delete-item" data-id="${item.producto.id}">🗑️</button>
        `;
        itemsContainer.appendChild(itemCard);
    });

    const subtotal = await getCartTotal(email);
    const total = subtotal + COSTO_ENVIO;

    document.getElementById("summary-subtotal")!.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("summary-shipping")!.textContent = `$${COSTO_ENVIO.toFixed(2)}`;
    document.getElementById("summary-total")!.textContent = `$${total.toFixed(2)}`;

    await actualizarBadgeNavbar();
    vincularEventosAcciones(email);
};

// Vinculación de eventos: agregar/restar productos / vaciar carrito
const vincularEventosAcciones = (email: string): void => {
    document.getElementById("cart-items-container")!.onclick = async (e) => {
        const target = e.target as HTMLElement;
        const id = Number(target.dataset.id);
        if (!id) return;

        const cart = await getCartByEmail(email);
        const item = cart.find(i => i.producto.id === id);
        if (!item) return;
        const cantidadActual = document.querySelector(`.qty-value-${item.producto.id}`)!;
        let numeroActual = parseInt(cantidadActual.textContent.trim(), 10);

        if (target.classList.contains("btn-plus")) {
            //  Validación respetando el stock disponible 
            if (item.cantidad >= item.producto.stock) {
                AlertService.warning(
                    "Error",
                    `Lo sentimos, no hay más stock disponible (${item.producto.stock} unidades máx).`);
                return;
            }

            cantidadActual.textContent = (numeroActual + 1).toString();
            //sumamos 1 por cada click
            await updateCartItemQuantity(id, item.cantidad + 1, email);
            await actualizarBadgeNavbar();
            renderizarCarrito(email);


        } else if (target.classList.contains("btn-minus")) {
            // Si tiene 1 solo y selecciona menos, updateCartItemQuantity lo va a filtrar/eliminar automáticamente
            cantidadActual.textContent = (numeroActual - 1).toString();
            await updateCartItemQuantity(id, item.cantidad - 1, email);
            await actualizarBadgeNavbar();
            renderizarCarrito(email);

        } else if (target.classList.contains("btn-delete-item")) {
            await removeFromCart(email, id);
            renderizarCarrito(email);
        }
    };

    // Botón Vaciar Todo
    document.getElementById("btn-clear-cart")!.onclick = () => {
        if (confirm("¿Estás seguro de que deseas vaciar tu carrito?")) {
            clearCart(email);
            renderizarCarrito(email);
        }
    };

    //Manejar el confirmar compra
    document.getElementById("btn-proceed-checkout")!.onclick = () => {
        abrirModalCheckout(email);
    };
};

/* --- CHECKOUT MODAL Y GENERACIÓN DE PEDIDO --- */
const abrirModalCheckout = async (email: string): Promise<void> => {
    const totalPagar = await getCartTotal(email) + COSTO_ENVIO;

    const htmlFormCheckout = `
        <h2 style="margin-bottom: 20px; color: var(--primary-color);">Completar Pedido</h2>
        <form id="form-checkout">
            <div class="form-group">
                <label for="checkout-phone">Teléfono de Contacto *</label>
                <input type="tel" id="checkout-phone" class="form-control" required placeholder="Ej: 1123456789">
            </div>
            
            <div class="form-group">
                <label for="checkout-address">Dirección de Entrega *</label>
                <input type="text" id="checkout-address" class="form-control" required placeholder="Calle, Número, Departamento">
            </div>

            <div class="form-group">
                <label for="checkout-payment">Método de Pago *</label>
                <select id="checkout-payment" class="form-control" required>
                    <option value="" disabled selected>Seleccione un método...</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta de Crédito / Débito</option>
                </select>
            </div>

            <div class="form-group">
                <label for="checkout-notes">Notas Adicionales (Opcional)</label>
                <textarea id="checkout-notes" class="form-control" rows="3" placeholder="Aclaraciones para el envío..."></textarea>
            </div>

            <div class="modal-footer-total">
                <div>
                    <span style="display:block; font-size:0.85rem; color:var(--text-muted);">Total a Pagar</span>
                    <strong style="font-size: 1.4rem; color: var(--primary-color);">$${totalPagar.toFixed(2)}</strong>
                </div>
                <button type="submit" class="btn btn-primary" style="padding: 12px 24px;">Confirmar Pedido</button>
            </div>
        </form>
    `;

    ModalService.open(htmlFormCheckout, () => {
        const form = document.getElementById("form-checkout") as HTMLFormElement;
        form.onsubmit = (e) => {
            e.preventDefault();
            const formaPago = (document.getElementById("checkout-payment") as HTMLSelectElement).value as any;
            procesarConfirmacionPedido(formaPago, totalPagar);
        };
    });
};

const procesarConfirmacionPedido = async (formaPago: FormaPago, total: number): Promise<void> => {
    const usuarioLogueado = getActiveUser(); 
    const cart = await getCartByEmail(usuarioLogueado.mail);
    const orders = await getOrdersByEmail(usuarioLogueado.mail);
    const nuevoPedido: IOrder = {
        id: orders.length+1,
        fecha: new Date().toISOString(),
        estado: "PENDIENTE",
        total: total,
        formaPago: formaPago,
        detalles: cart.map(item => ({
            cantidad: item.cantidad,
            subtotal: item.subtotal,
            producto: item.producto
        })),
        usuarioDto: usuarioLogueado,
    };

    await registrarNuevoPedidoDelCliente(usuarioLogueado.mail, nuevoPedido)
    await actualizarStockProductos(nuevoPedido);
    clearCart(usuarioLogueado.mail);
    await actualizarBadgeNavbar();

    ModalService.close();
    AlertService.success(
        "¡Pedido realizado con éxito!",
        "Redirigiendo a tus pedidos..."
    );
    setTimeout(() => window.location.href = "/pedidos", 1500)
        ;
};

const actualizarStockProductos = async (pedido: IOrder) => {

    const detallesPedido = pedido.detalles;
    for (const detalle of detallesPedido) {
        const productoId = detalle.producto.id;

        try {
            const producto = await getProduct(productoId);

            if (producto) {

                producto.stock -= detalle.cantidad;
                await saveOrUpdateProduct(producto);
            }
        } catch (error) {
            console.error(`Error al actualizar el stock del producto ID ${productoId}:`, error);
        }
    }
};