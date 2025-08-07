package com.fullstack.service;

import java.util.List;

import com.fullstack.model.AdminDTO;

public interface AdminService {

    AdminDTO getAdmin(String adminId);

    void createAdmin(AdminDTO adminDTO);

    void updateAdmin(AdminDTO adminDTO);

    void deleteAdmin(String adminId);

    List<AdminDTO> getAdminList();
}
