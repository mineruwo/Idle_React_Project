package com.fullstack.service;

import com.fullstack.model.AdminDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface AdminService {

    AdminDTO getAdmin(String adminId);

    AdminDTO createAdmin(AdminDTO adminDTO);

    Page<AdminDTO> getAdminList(Pageable pageable);
}