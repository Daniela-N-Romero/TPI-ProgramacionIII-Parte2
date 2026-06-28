package com.tp.jpa.model.entities;

import com.tp.jpa.Calculable;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


@Entity
@Table(name = "pedidos")
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

public class Pedido extends Base implements Calculable {
    private LocalDate fecha;
    @Enumerated(EnumType.STRING)
    private Estado estado;
    @Builder.Default
    private Double total = 0.0;
    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;

    // Composición: El pedido maneja el ciclo de vida de sus detalles, por eso usamos orphanRemoval = true
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id") // Clave foránea en la tabla detalle_pedido
    @Builder.Default
    private Set<DetallePedido> detalles = new HashSet<DetallePedido>();

    public void calcularTotal() {
        this.total = detalles.stream()
                .map(DetallePedido::getSubtotal)// DetallePedido::getSubtotal es lo mismo que "detalle -> detalle.getSubtotal()"
                .reduce(0.0, Double::sum);  //Double::sum fue una sugerencia de IntelliJ para reemplazar "(a, b) -> a + b"
    }

    public DetallePedido findDetallePedido(Producto producto) {
        for(DetallePedido detalle : detalles) {
            if(Objects.equals(detalle.getProducto(), producto)) {
                return detalle;
            }
        }
        return null;
    }

    public int cantidadItems(){
        return detalles.stream()
                .map(DetallePedido::getCantidad)
                .reduce(0, Integer::sum);
    }

    public void addDetallePedido(int cantidad, Producto producto) {

        DetallePedido detalleExistente = findDetallePedido(producto);

        if (detalleExistente != null) {
            // Si ya existía, le aumentamos la cantidad al detalle que ya tenemos
            detalleExistente.setCantidad(detalleExistente.getCantidad() + cantidad);
        } else {
            // Si es un producto nuevo, creamos el detalle de cero
            DetallePedido nuevoDetalle = new DetallePedido(cantidad, producto);
            this.detalles.add(nuevoDetalle);
        }

        calcularTotal();
    }

    public void deleteDetallePedido(Producto producto) {
        detalles.removeIf(  detalle -> Objects.equals(detalle.getProducto(), producto));
        calcularTotal();
    }


    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n")
                .append("PEDIDO #").append(this.getId()).append("\n") // Heredado de Base
                .append("Fecha: ").append(fecha).append("\n")
                .append("Estado: ").append(estado).append("\n")
                .append("Forma de Pago: ").append(formaPago).append("\n")
                .append("-----------------------------------------\n");
        return sb.toString();
    }
}



