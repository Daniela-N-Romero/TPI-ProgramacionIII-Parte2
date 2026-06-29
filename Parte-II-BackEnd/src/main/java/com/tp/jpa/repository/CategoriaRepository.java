package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Categoria;
import com.tp.jpa.model.entities.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;

public class CategoriaRepository extends BaseRepositoryImpl<Categoria> {

    public CategoriaRepository(EntityManagerFactory emf) {
        super(emf, Categoria.class);
    }

    // Consulta JPQL: retorna los productos activos de una categoría.
    // Como la relación es unidireccional y Categoria es la dueña, se
    // navega desde Categoria hacia su colección c.productos mediante JOIN
    // y devuelve lista de productos que tengan estén registrados como pertenecientes
    // a esa categoria (WHERE c.id = :catId) y no estén eliminados (p.eliminado = false)
    
    public List<Producto> buscarProductosPorCategoria(Long categoriaId) {
        EntityManager em = this.emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Categoria c JOIN c.productos p WHERE c.id = :catId AND p.eliminado = false";

            return em.createQuery(jpql, Producto.class)
                    .setParameter("catId", categoriaId)
                    .getResultList();
        } catch (Exception e) {
            throw e;
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

}