package com.tp.jpa.util;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JPAUtil {

    // Instancia única y estática del factory
    private static EntityManagerFactory emf;

    // Constructor privado para evitar que instancien la clase con 'new JPAUtil()'
    private JPAUtil() {}

    public static EntityManagerFactory getEntityManagerFactory() {
        if (emf == null) {
            try {
                emf = Persistence.createEntityManagerFactory("miUnidad");
            } catch (Exception e) {
                System.err.println("No se pudo inicializar el EntityManagerFactory: " + e.getMessage());
                throw new ExceptionInInitializerError(e);
            }
        }
        return emf;
    }

    public static void close() {
        if (emf != null && emf.isOpen()) {
            emf.close();
            System.out.println("--- EntityManagerFactory cerrado correctamente ---");
        }
    }

}
