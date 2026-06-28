package com.tp.jpa.repository;

import com.tp.jpa.model.entities.Base;
import java.util.List;
import java.util.Optional;

public interface BaseRepository<T extends Base> {
    Optional<T>  buscarPorId(Long id);
    List<T> listarActivos();
    T guardar(T entity);
    boolean eliminarLogico(Long id);}