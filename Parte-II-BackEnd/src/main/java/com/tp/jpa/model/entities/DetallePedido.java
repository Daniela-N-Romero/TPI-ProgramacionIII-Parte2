package com.tp.jpa.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "detalles_pedido")
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido extends Base {
    private int cantidad;
    // Muchos detalles apuntan a un Producto
    @ManyToOne // FetchType.EAGER  pro defecto: el detalle necesita saber qué producto es para mostrar el nombre en el ticket.
    @JoinColumn(name = "producto_id")
    private Producto producto;
    private Double subtotal;

    public DetallePedido(int cantidad, Producto producto) {
        super();
        this.cantidad = cantidad;
        this.producto = producto;
        this.subtotal = cantidad * producto.getPrecio();
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append(producto.getNombre())
            .append(" ($").append(producto.getPrecio())
            .append(" x").append(cantidad).append(")")
            .append(" [Subtotal: $").append(subtotal).append("]");
        return sb.toString();
    }
}
