package com.tp.jpa.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Objects;


@MappedSuperclass
@SuperBuilder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Builder.Default
    private boolean eliminado = false;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}