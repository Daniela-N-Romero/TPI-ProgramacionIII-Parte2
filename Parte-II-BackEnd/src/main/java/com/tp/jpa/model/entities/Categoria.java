package com.tp.jpa.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categorias")
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Categoria extends Base{
    private String nombre;
    private String descripcion;
    // Agregación: Una categoría tiene muchos productos
    @OneToMany //por defecto es FetchType.LAZY
    @JoinColumn(name = "categoria_id") // Guarda la categoría en la tabla de Productos
    @Builder.Default //crea el hashset vacio
    private Set<Producto> productos = new HashSet<>();

    public void addProducto(Producto producto) {
        this.productos.add(producto);
    }

    public void deleteProducto(Producto producto) {
        this.productos.remove(producto);
    }
}
