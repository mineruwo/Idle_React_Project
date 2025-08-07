package com.fullstack.controller;

import com.fullstack.model.AdminDTO;
import com.fullstack.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminDTO adminDTO) {
        AdminDTO foundAdmin = adminService.getAdmin(adminDTO.getAdminId());

        if (foundAdmin != null && foundAdmin.getPassword().equals(adminDTO.getPassword())) {
            // 로그인 성공
            return ResponseEntity.ok(foundAdmin); // 또는 필요한 정보만 반환
        } else {
            // 로그인 실패
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
