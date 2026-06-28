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
    public List<Producto> buscarProductosPorCategoria(Long categoria_id) {
        EntityManager em = this.emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Categoria c JOIN c.productos p WHERE c.id = :categoria_id AND p.eliminado = false";

            return em.createQuery(jpql, Producto.class)
                    .setParameter("categoria_id", categoria_id)
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