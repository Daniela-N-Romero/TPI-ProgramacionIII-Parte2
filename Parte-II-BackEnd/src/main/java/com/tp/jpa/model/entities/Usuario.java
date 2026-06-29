package com.tp.jpa.model.entities;
import com.tp.jpa.model.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario extends Base {
    private String nombre;
    private String apellido;
    @Column(unique = true)
    private String mail;
    private String contrasenia;
    private String celular;
    @Enumerated(EnumType.STRING)
    private Rol rol;
    // Relación 1..m: Un usuario tiene muchos pedidos
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id") // Crea la clave foránea directamente en la tabla de Pedidos
    @Builder.Default //para que por defecto haya un set vacio
    private Set<Pedido> pedidos = new HashSet<>();

   public void addPedidos(Pedido pedido) {
        this.pedidos.add(pedido);
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Usuario{");
        sb.append(super.toString())
            .append(", nombre='").append(nombre).append('\'')
            .append(", apellido='").append(apellido).append('\'')
            .append(", mail='").append(mail).append('\'')
            .append(", rol=").append(rol)
            .append('}');
        return sb.toString();
    }
}
