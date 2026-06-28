package com.tp.jpa.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "productos")
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Producto extends Base {
    private String nombre;
    private double precio;
    private String descripcion;
    private int stock;
    private String imagen;
    private boolean disponible;

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append(super.getId()).append("\t");
        sb.append(nombre).append("\t");
        sb.append("precio: $").append(precio).append("\t");
        sb.append("descripcion= '").append(descripcion).append("' \t \t");
        sb.append("stock= ").append(stock);
        return sb.toString();
    }
}
