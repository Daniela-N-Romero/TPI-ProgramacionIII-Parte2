package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Pedido;
import com.tp.jpa.model.enums.Estado;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;

public class PedidoRepository extends BaseRepositoryImpl<Pedido> {

     public PedidoRepository(EntityManagerFactory emf) {
        super(emf, Pedido.class);
    }

    // Consulta JPQL: retorna todos los pedidos activos con un estado específico
    // Se filtra por: PENDIENTE, CONFIRMADO, TERMINADO o CANCELADO

    public List<Pedido> buscarPorEstado(Estado estado) {
        EntityManager em = this.emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";

            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estado)
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
