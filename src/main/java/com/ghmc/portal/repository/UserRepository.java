package com.ghmc.portal.repository;

import com.ghmc.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<User> findByRoleAndAssignedWard(com.ghmc.portal.model.Role role, String assignedWard);
    Optional<User> findByAssignedWard(String assignedWard);
}
