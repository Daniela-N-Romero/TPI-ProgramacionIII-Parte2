import { ModalService } from '../../../utils/modals/modal';
import { AlertService } from '../../../utils/modals/alert';
import { getActiveUser } from '../../../utils/storage/userStorage';
import { getCategories } from '../../../utils/storage/categoryStorage';
import type { ICategory } from '../../../types/ICategory';
import type {IProduct} from '../../../types/IProduct'
import { navigate } from '../../../utils/guards/guards';
import { saveArray } from '../../../utils/storage/storageBase';
import { getProducts } from '../../../utils/storage/productStorage';

document.addEventListener("DOMContentLoaded", () => {
  ModalService.init();
  const user = getActiveUser();
  const main = document.querySelector(".main-content");
  if (user?.rol === "ADMIN") {
    main?.classList.add("main-content-block")
    renderGestionCategorias();
  }else{
    navigate("./tienda")
  }
});


let categoriasEnMemoria: ICategory[] = [];
let productosEnMemoria: IProduct[] = [];

export const renderGestionCategorias = async () => {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  // Cargar estado en memoria desde storage (inicializado por el semilla)
  categoriasEnMemoria = await getCategories();
  productosEnMemoria = await getProducts();

  mainContent.innerHTML = `
    <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Categorías</h2>
      <button id="btn-nueva-categoria" class="btn btn-success" style="background-color: #2ed573; color: white; font-weight: bold;">
        ➕ Nueva Categoría
      </button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="categories-table-body"></tbody>
    </table>
  `;

  document.getElementById('btn-nueva-categoria')?.addEventListener('click', () => abrirModalCategoria());
  refrescarTablaCategorias();
};

const obtenerImagenCategoria = (categoriaId: number): string => {
  const productoAsociado = productosEnMemoria.find(p => p.categoria && p.categoria.id === categoriaId && p.imagen);
  
  if (productoAsociado) {
    return productoAsociado.imagen;
  }
  
  // Imagen genérica por si la categoría no tiene ítems asignados aún
  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=150&auto=format&fit=crop&q=60'; 
};

const refrescarTablaCategorias = () => {
  const tbody = document.getElementById('categories-table-body');
  if (!tbody) return;

  tbody.innerHTML = categoriasEnMemoria.map(cat => {
    
    const imagenUrl = obtenerImagenCategoria(cat.id); 
    
    return`
    <tr>
      <td><strong>#${cat.id}</strong></td>
      <td><img src="${imagenUrl}" alt="${cat.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;"></td>
      <td><strong>${cat.nombre}</strong></td>
      <td>${cat.descripcion}</td>
      <td>
        <button class="btn-edit-cat btn-small" data-id="${cat.id}" style="background: #3182ce; color: white;">✏️</button>
        <button class="btn-delete-cat btn-small" data-id="${cat.id}" style="background: #e53e3e; color: white;">🗑️</button>
      </td>
    </tr>
  `}).join('');

  // Enganchar eventos a los botones dinámicos
  tbody.querySelectorAll('.btn-edit-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
      const categoria = categoriasEnMemoria.find(c => c.id === id);
      if (categoria) abrirModalCategoria(categoria);
    });
  });

tbody.querySelectorAll('.btn-delete-cat').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
    
    // Traemos los productos para verificar la dependencia
    const { getElementsFromStorage } = await import('../../../utils/storage/storageBase');
    const productos = await getElementsFromStorage<IProduct>('products');

    // Verificamos si al menos un producto depende de esta categoría
    const tieneProductosAsociados = productos.some(prod => prod.categoria && prod.categoria.id === id);

    if (tieneProductosAsociados) {
      AlertService.warning(
        "Acción Bloqueada", 
        "No se puede eliminar esta categoría porque tiene productos asociados. Por favor, edita o elimina primero esos productos."
      );
      return;
    }

    // Si no tiene productos asociados, procedemos con el borrado normal
    AlertService.confirm(
      "¿Eliminar Categoría?",
      "¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.",
      () => {
        categoriasEnMemoria = categoriasEnMemoria.filter(c => c.id !== id);
        saveArray(categoriasEnMemoria, 'categories');
        refrescarTablaCategorias();
        AlertService.success("Eliminada", "La categoría vacía fue removida correctamente.");
      }
    );
  });
});

};

const abrirModalCategoria = (categoria?: ICategory) => {
  const esEdicion = !!categoria;
  
  const modalHTML = `
    <h3>${esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
    <form id="form-categoria">
      <div class="form-group">
        <label>Nombre *</label>
        <input type="text" id="cat-nombre" class="form-control" value="${categoria?.nombre || ''}" required>
      </div>
      <div class="form-group">
        <label>Descripción *</label>
        <textarea id="cat-descripcion" class="form-control" required>${categoria?.descripcion || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" id="btn-cancelar-cat" class="btn">Cancelar</button>
        <button type="submit" class="btn btn-success" style="background: #2ed573; color: white;">Guardar</button>
      </div>
    </form>
  `;

  ModalService.open(modalHTML, () => {
    document.getElementById('btn-cancelar-cat')?.addEventListener('click', () => ModalService.close());
    
    document.getElementById('form-categoria')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nombre = (document.getElementById('cat-nombre') as HTMLInputElement).value.trim();
      const descripcion = (document.getElementById('cat-descripcion') as HTMLTextAreaElement).value.trim();

      if (esEdicion && categoria) {
        categoria.nombre = nombre;
        categoria.descripcion = descripcion;

      } else {
        const nuevoId = categoriasEnMemoria.length > 0 ? Math.max(...categoriasEnMemoria.map(c => c.id)) + 1 : 1;
        categoriasEnMemoria.push({ id: nuevoId, nombre, descripcion });
      }

      saveArray(categoriasEnMemoria, 'categories');
      refrescarTablaCategorias();
      ModalService.close();
      AlertService.success("Éxito", `Categoría ${esEdicion ? 'actualizada' : 'creada'} correctamente.`);
    });
  });
}