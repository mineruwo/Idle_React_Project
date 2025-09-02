package com.fullstack.repository;

import com.fullstack.entity.AdminEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Import this

public interface AdminRepository extends JpaRepository<AdminEntity, Integer>, JpaSpecificationExecutor<AdminEntity> { // Add JpaSpecificationExecutor

    Optional<AdminEntity> findByAdminIdAndIsDelFalse(String adminId);

    Optional<AdminEntity> findByAdminId(String adminId); // Added this line

    @Query("SELECT a FROM AdminEntity a WHERE a.isDel = false ORDER BY a.regDate DESC")
    List<AdminEntity> findAllActiveAdmins();
}
