package com.ghmc.portal.repository;

import com.ghmc.portal.model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, String> {
    Optional<Zone> findByCode(String code);
}
