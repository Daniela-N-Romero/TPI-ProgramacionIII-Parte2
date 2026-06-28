package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Usuario;
import com.tp.jpa.model.entities.Pedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepositoryImpl<Usuario> {

    public UsuarioRepository(EntityManagerFactory emf) {
        super(emf, Usuario.class);
    }


// Consulta JPQL: retorna los pedidos activos de un usuario.
// Como la relación es unidireccional y Usuario es el dueño, se navega
// desde Usuario hacia su colección u.pedidos mediante JOIN.
// Se filtra por el id del usuario (:uid) y por p.eliminado = false
// para excluir las bajas lógicas.

    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = this.emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p WHERE u.id = :uid AND p.eliminado = false";

            return em.createQuery(jpql, Pedido.class)
                    .setParameter("uid", idUsuario)
                    .getResultList();

        } catch (Exception e) {
            throw e;
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

    // Consulta JPQL: busca un usuario activo por su dirección de correo electrónico
    // Retorna Optional para manejar el caso en que el mail no esté registrado String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = this.emf.createEntityManager();

        try {
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";

            List<Usuario> res = em.createQuery(jpql, Usuario.class)
                .setParameter("mail", mail)
                .getResultList();

            return res.isEmpty() ? Optional.empty() : Optional.of(res.get(0));

        } catch (Exception e) {
            throw e;
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

}
