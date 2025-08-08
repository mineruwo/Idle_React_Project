package com.fullstack.controller;

import com.fullstack.model.AdminDTO;
import com.fullstack.model.AdminLoginRequestDTO;
import com.fullstack.model.AdminLoginResponseDTO;
import com.fullstack.service.AdminService;
import com.fullstack.security.JWTUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponseDTO> login(@RequestBody AdminLoginRequestDTO loginRequestDTO, HttpServletResponse response) {
        AdminDTO foundAdmin = adminService.getAdmin(loginRequestDTO.getAdminId());

        if (foundAdmin != null && passwordEncoder.matches(loginRequestDTO.getPassword(), foundAdmin.getPassword())) {
            String token = jwtUtil.generateToken(foundAdmin.getAdminId(), foundAdmin.getRole().name());

            ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());

            return ResponseEntity.ok(new AdminLoginResponseDTO(foundAdmin));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String adminId = authentication.getName();
            AdminDTO adminDTO = adminService.getAdmin(adminId);
            if (adminDTO != null) {
                return ResponseEntity.ok(adminDTO);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok("Logged out successfully");
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