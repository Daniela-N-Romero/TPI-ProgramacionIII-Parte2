import { getElementsFromStorage, saveArray } from '../../../utils/storage/storageBase';
import { ModalService } from '../../../utils/modals/modal';
import { AlertService } from '../../../utils/modals/alert';
import type { IProduct } from '../../../types/IProduct';
import type { ICategory } from '../../../types/ICategory';
import { navigate } from '../../../utils/guards/guards';
import { getActiveUser } from '../../../utils/storage/userStorage';


document.addEventListener("DOMContentLoaded", () => {
  ModalService.init();
  const user = getActiveUser();
  const main = document.querySelector(".main-content");
  if (user?.rol === "ADMIN") {
    main?.classList.add("main-content-block")
    renderGestionProductos();
  }else{
    navigate("./tienda")
  }
});

let productosEnMemoria: IProduct[] = [];
let categoriasDisponibles: ICategory[] = [];

export const renderGestionProductos = async () => {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  // Traer los estados correspondientes de memoria
  productosEnMemoria = await getElementsFromStorage<IProduct>('products');
  categoriasDisponibles = await getElementsFromStorage<ICategory>('categories');

  mainContent.innerHTML = `
    <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Productos</h2>
      <button id="btn-nuevo-producto" class="btn btn-success" style="background-color: #2ed573; color: white; font-weight: bold;">
        ➕ Nuevo Producto
      </button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="products-table-body"></tbody>
    </table>
  `;

  document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => abrirModalProducto());
  refrescarTablaProductos();
};

const refrescarTablaProductos = () => {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  tbody.innerHTML = productosEnMemoria.map(prod => `
    <tr>
      <td><strong>#${prod.id}</strong></td>
      <td><img src="${prod.imagen}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
      <td><strong>${prod.nombre}</strong></td>
      <td>$${prod.precio}</td>
      <td><span class="badge-category">${prod.categoria?.nombre || 'Sin categoría'}</span></td>
      <td>${prod.stock} u.</td>
      <td>
        <span class="status-badge ${prod.disponible ? 'status-terminado' : 'status-pendiente'}">
          ${prod.disponible ? 'Disponible' : 'No disp.'}
        </span>
      </td>
      <td>
        <button class="btn-edit-prod btn-small" data-id="${prod.id}" style="background: #3182ce; color: white;">✏️</button>
        <button class="btn-delete-prod btn-small" data-id="${prod.id}" style="background: #e53e3e; color: white;">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-edit-prod').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
      const producto = productosEnMemoria.find(p => p.id === id);
      if (producto) abrirModalProducto(producto);
    });
  });

  tbody.querySelectorAll('.btn-delete-prod').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
      
      AlertService.confirm(
        "¿Desactivar Producto?",
        "El producto cambiará su estado de disponibilidad a 'False' (Soft Delete).",
        () => {
          const producto = productosEnMemoria.find(p => p.id === id);
          if (producto) {
            producto.disponible = false; // Soft Delete exigido
            saveArray(productosEnMemoria, 'products');
            refrescarTablaProductos();
            AlertService.success("Desactivado", "El producto ya no se mostrará como disponible en el catálogo.");
          }
        }
      );
    });
  });
};

const abrirModalProducto = (producto?: IProduct) => {
  const esEdicion = !!producto;

  // Renderizar dinámicamente las opciones del select de categorías existentes
  const opcionesCategorias = categoriasDisponibles.map(cat => `
    <option value="${cat.id}" ${producto?.categoria?.id === cat.id ? 'selected' : ''}>${cat.nombre}</option>
  `).join('');

  const modalHTML = `
    <h3>${esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
    <form id="form-producto">
      <div class="form-group">
        <label>Nombre del Producto *</label>
        <input type="text" id="prod-nombre" class="form-control" value="${producto?.nombre || ''}" required>
      </div>
      <div class="form-group">
        <label>Descripción *</label>
        <textarea id="prod-descripcion" class="form-control" required>${producto?.descripcion || ''}</textarea>
      </div>
      <div style="display: flex; gap: 15px;">
        <div class="form-group" style="flex: 1;">
          <label>Precio ($) *</label>
          <input type="number" id="prod-precio" class="form-control" min="0.01" step="0.01" value="${producto?.precio || ''}" required>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Stock Inicial *</label>
          <input type="number" id="prod-stock" class="form-control" min="0" value="${producto?.stock ?? ''}" required>
        </div>
      </div>
      <div class="form-group">
        <label>Categoría *</label>
        <select id="prod-categoria" class="form-control" required>
          <option value="" disabled selected>Seleccione una categoría</option>
          ${opcionesCategorias}
        </select>
      </div>
      <div class="form-group">
        <label>URL de Imagen *</label>
        <input type="url" id="prod-imagen" class="form-control" value="${producto?.imagen || ''}" required>
      </div>
      <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
        <input type="checkbox" id="prod-disponible" ${producto ? (producto.disponible ? 'checked' : '') : 'checked'}>
        <label for="prod-disponible" style="margin: 0; font-weight: normal;">Producto Disponible para la venta</label>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" id="btn-cancelar-prod" class="btn">Cancelar</button>
        <button type="submit" class="btn btn-success" style="background: #2ed573; color: white;">Guardar Producto</button>
      </div>
    </form>
  `;

  ModalService.open(modalHTML, () => {
    document.getElementById('btn-cancelar-prod')?.addEventListener('click', () => ModalService.close());

    document.getElementById('form-producto')?.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = (document.getElementById('prod-nombre') as HTMLInputElement).value.trim();
      const descripcion = (document.getElementById('prod-descripcion') as HTMLTextAreaElement).value.trim();
      const precio = parseFloat((document.getElementById('prod-precio') as HTMLInputElement).value);
      const stock = parseInt((document.getElementById('prod-stock') as HTMLInputElement).value);
      const categoriaId = parseInt((document.getElementById('prod-categoria') as HTMLSelectElement).value);
      const imagen = (document.getElementById('prod-imagen') as HTMLInputElement).value.trim();
      const disponible = (document.getElementById('prod-disponible') as HTMLInputElement).checked;

      // Criterio 4: Validaciones explícitas de negocio
      if (precio <= 0) {
        AlertService.warning(
        "Error", 
        "El precio debe ser un número mayor a 0."
      );
        return;
      }
      if (stock < 0) {
         AlertService.warning(
        "Error", 
        "El stock no puede ser un número negativo."
      );
        return;
      }

      const categoriaSeleccionada = categoriasDisponibles.find(c => c.id === categoriaId);
      if (!categoriaSeleccionada) {
          AlertService.warning(
        "Error", 
        "Ingresar una categoria válida."
      );
        return;
      }

      if (esEdicion && producto) {
        producto.nombre = nombre;
        producto.descripcion = descripcion;
        producto.precio = precio;
        producto.stock = stock;
        producto.categoria = categoriaSeleccionada; // Resuelve tu duda: pisa el embebido con la categoría real actualizada
        producto.imagen = imagen;
        producto.disponible = disponible;
      } else {
        const nuevoId = productosEnMemoria.length > 0 ? Math.max(...productosEnMemoria.map(p => p.id)) + 1 : 1;
        productosEnMemoria.push({
          id: nuevoId, nombre, descripcion, precio, stock, categoria: categoriaSeleccionada, imagen, disponible
        });
      }

      saveArray(productosEnMemoria, 'products');
      refrescarTablaProductos();
      ModalService.close();
      AlertService.success("Guardado", `Producto ${esEdicion ? 'modificado' : 'creado'} con éxito.`);
    });
  });
};