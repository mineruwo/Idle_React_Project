package com.fullstack.controller;

import com.fullstack.entity.Admin;
import com.fullstack.model.AdminDTO;
import com.fullstack.model.LoginRequestDTO;
import com.fullstack.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        AdminDTO foundAdmin = adminService.getAdmin(loginRequestDTO.getAdminId());

        if (foundAdmin != null && foundAdmin.getPassword().equals(loginRequestDTO.getPassword())) {
            // 로그인 성공
            return ResponseEntity.ok(foundAdmin); // 또는 필요한 정보만 반환
        } else {
            // 로그인 실패
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @GetMapping("/accounts")
    @PreAuthorize("hasRole('DEV_ADMIN') or hasRole('ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<Page<AdminDTO>> getAdminList(Pageable pageable) {
        Page<AdminDTO> adminPage = adminService.getAdminList(pageable);
        return ResponseEntity.ok(adminPage);
    }

    @PostMapping("/accounts")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> createAdmin(@RequestBody AdminDTO adminDTO) {
        try {
            AdminDTO createdAdmin = adminService.createAdmin(adminDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAdmin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating admin: " + e.getMessage());
        }
    }
}
