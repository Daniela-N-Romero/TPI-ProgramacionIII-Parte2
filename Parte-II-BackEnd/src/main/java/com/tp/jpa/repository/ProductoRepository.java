package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Producto;
import jakarta.persistence.EntityManagerFactory;

public class ProductoRepository extends BaseRepositoryImpl<Producto> {

    public ProductoRepository(EntityManagerFactory emf) {
        super(emf, Producto.class);
    }

}