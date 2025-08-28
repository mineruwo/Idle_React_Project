package com.fullstack.service;

import com.fullstack.model.AdminDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface AdminService {

    AdminDTO getAdmin(String adminId);

    AdminDTO getAdminById(Integer id);

    AdminDTO createAdmin(AdminDTO adminDTO);

    AdminDTO updateAdmin(Integer id, AdminDTO adminDTO);

    void deleteAdmin(Integer id);

    Page<AdminDTO> getAdminList(Pageable pageable, String role, String searchType, String searchQuery);

    Page<AdminDTO> getRecentlyCreatedAdmins(Pageable pageable, String dateRange);
    Page<AdminDTO> getRecentlyDeletedAdmins(Pageable pageable, String dateRange);
}