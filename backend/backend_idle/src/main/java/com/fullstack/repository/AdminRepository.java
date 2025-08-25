package com.fullstack.repository;

import com.fullstack.entity.Admin;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Import this

public interface AdminRepository extends JpaRepository<Admin, Integer>, JpaSpecificationExecutor<Admin> { // Add JpaSpecificationExecutor

    Optional<Admin> findByAdminIdAndIsDelFalse(String adminId);

    @Query("SELECT a FROM Admin a WHERE a.isDel = false ORDER BY a.regDate DESC")
    List<Admin> findAllActiveAdmins();
}
