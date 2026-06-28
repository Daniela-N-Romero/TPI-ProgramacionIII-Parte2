package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Usuario;
import com.tp.jpa.model.entities.Pedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;

public class UsuarioRepository extends BaseRepositoryImpl<Usuario> {

    public UsuarioRepository(EntityManagerFactory emf) {
        super(emf, Usuario.class);
    }

    public List<Pedido> buscarPedidosPorUsuario(Long usuario_id) {
        EntityManager em = this.emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p WHERE u.id = :usuarioId";

            return em.createQuery(jpql, Pedido.class)
                    .setParameter("usuario_id", usuario_id)
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
