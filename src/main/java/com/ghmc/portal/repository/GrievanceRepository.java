package com.ghmc.portal.repository;

import com.ghmc.portal.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, String> {

    // Multi-tenant query: Fetch grievances strictly belonging to a specific GHMC Zone
    List<Grievance> findByZoneCodeOrderByCreatedAtDesc(String zoneCode);

    // Fetch grievances filed by a specific citizen
    List<Grievance> findByCitizenEmailOrderByCreatedAtDesc(String citizenEmail);
}
