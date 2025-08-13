package com.fullstack.controller;

import com.fullstack.entity.Notice;
import com.fullstack.model.AdminDTO;
import com.fullstack.model.AdminLoginRequestDTO;
import com.fullstack.model.AdminLoginResponseDTO;
import com.fullstack.service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.NoticeDTO;
import com.fullstack.service.CustomerService;
import com.fullstack.service.NoticeService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import com.fullstack.service.ChatSessionService;
import com.fullstack.model.ChatSessionDTO;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.fullstack.security.jwt.JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private ChatSessionService chatSessionService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponseDTO> login(@RequestBody AdminLoginRequestDTO loginRequestDTO, HttpServletResponse response) {
        AdminDTO foundAdmin = adminService.getAdmin(loginRequestDTO.getAdminId());

        if (foundAdmin != null && passwordEncoder.matches(loginRequestDTO.getPassword(), foundAdmin.getPassword())) {

            String token = jwtUtil.generateAccessToken(foundAdmin.getAdminId(),foundAdmin.getRole().name(), Duration.ofDays(1));
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

    @GetMapping("/customers")
    public ResponseEntity<Page<CustomerDTO>> getCustomerList(Pageable pageable) {
        Page<CustomerDTO> customerPage = customerService.getCustomers(pageable).map(customer -> new CustomerDTO().builder()
                .id(customer.getId())
                .role(customer.getRole())
                .createdAt(customer.getCreatedAt())
                .customName(customer.getCustomName()).build());
        return ResponseEntity.ok(customerPage);
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

    @PostMapping("/customers")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> createCustomer(@RequestBody CustomerDTO customerDTO) {
        System.out.println("Received customer creation request for: " + customerDTO);
        try {
            CustomerDTO createdCustomer = customerService.createCustomer(customerDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating customer: " + e.getMessage());
        }
    }

    @PostMapping("/notices")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> createNotice(@RequestBody NoticeDTO noticeDTO) {
        try {
            Notice createdNotice = noticeService.createNotice(noticeDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating notice: " + e.getMessage());
        }
    }

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getAllNotices() {
        List<Notice> notices = noticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    // Test API for PathVariable
    @GetMapping("/test/path/{testValue}")
    public ResponseEntity<String> testPathVariable(@PathVariable String testValue) {
        System.out.println("Test PathVariable received: " + testValue);
        return ResponseEntity.ok("PathVariable received: " + testValue);
    }

    // Moved from AdminChatController
    @GetMapping("/chat-sessions/{chatRoomId}/details")
    public ResponseEntity<Map<String, Object>> getChatSessionDetails(@PathVariable String chatRoomId) {
        Optional<ChatSessionDTO> chatSessionOptional = chatSessionService.getChatSessionDetailsByChatRoomId(chatRoomId);

        if (chatSessionOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChatSessionDTO chatSession = chatSessionOptional.get();

        Map<String, Object> customerInfo = new HashMap<>();
        if (chatSession.getCustomer() != null) {
            customerInfo.put("id", chatSession.getCustomer().getId());
            customerInfo.put("name", chatSession.getCustomer().getCustomName());
            // Assuming contact and email are not in CustomerDTO for now, or need to be fetched
            customerInfo.put("contact", "N/A"); // Placeholder
            customerInfo.put("email", "N/A"); // Placeholder
        } else {
            customerInfo.put("id", "unknown");
            customerInfo.put("name", "Unknown Customer");
            customerInfo.put("contact", "N/A");
            customerInfo.put("email", "N/A");
        }


        Map<String, Object> participant1 = new HashMap<>();
        participant1.put("id", customerInfo.get("id"));
        participant1.put("role", "고객");

        Map<String, Object> participant2 = new HashMap<>();
        participant2.put("id", "admin456"); // Still hardcoded, as AdminEntity is not linked to ChatSession yet
        participant2.put("role", "상담원");

        Map<String, Object> response = new HashMap<>();
        response.put("chatRoomId", chatSession.getChatRoomId());
        response.put("sessionId", chatSession.getSessionId());
        response.put("createdAt", chatSession.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        response.put("customer", customerInfo);
        response.put("participants", Arrays.asList(participant1, participant2));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat-sessions")
    public ResponseEntity<ChatSessionDTO> createChatSession(@RequestBody ChatSessionDTO chatSessionDTO) {
        try {
            // In a real scenario, you might want to validate chatSessionDTO
            // and ensure the customer exists or is created.
            // The service layer handles the UUID generation for sessionId and createdAt.
            ChatSessionDTO createdSession = chatSessionService.createChatSession(chatSessionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (RuntimeException e) {
            // Example error handling for "Customer not found" or other service-level exceptions
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Or a more specific error DTO
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/chat-sessions/{chatRoomId}")
    public ResponseEntity<Void> deleteChatSession(@PathVariable String chatRoomId) {
        chatSessionService.deleteChatSessionByChatRoomId(chatRoomId);
        return ResponseEntity.noContent().build();
    }
}
