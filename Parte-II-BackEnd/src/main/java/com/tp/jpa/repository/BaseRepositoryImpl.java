package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Base;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;
import java.util.Optional;

public abstract class BaseRepositoryImpl<T extends Base> implements BaseRepository<T> {

    protected final EntityManagerFactory emf;
    private final Class<T> entityClass;

    public BaseRepositoryImpl(EntityManagerFactory emf, Class<T> entityClass) {
        this.emf = emf;
        this.entityClass = entityClass;
    }

    @Override
    public Optional<T> buscarPorId(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            T entity = em.find(entityClass, id);
            if (entity == null || entity.isEliminado()) {
                return Optional.empty();
            }
            return Optional.of(entity);
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

    @Override
    public List<T> listarActivos() {
        EntityManager em = emf.createEntityManager();
        // Consultamos únicamente los registros donde eliminado = false
        try {
            String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.eliminado = false";
            return em.createQuery(jpql, entityClass).getResultList();
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

    @Override
    public T guardar(T entidad) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            T persistida = em.merge(entidad); // Guardamos la copia que tiene el ID real de la BD
            em.getTransaction().commit();
            return persistida; // Devolvemos la entidad con el ID
        } catch (Exception e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw e;
        } finally {
            if (em != null && em.isOpen()) em.close();
        }
    }

    @Override
    public boolean eliminarLogico(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            T entity = em.find(entityClass, id);
            if (entity == null || entity.isEliminado()) {
                return false;
            }
            em.getTransaction().begin();
            entity.setEliminado(true);
            em.getTransaction().commit();
            return true;
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw e;
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }
}