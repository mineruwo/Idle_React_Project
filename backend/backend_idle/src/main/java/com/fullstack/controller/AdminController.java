package com.fullstack.controller;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.Faq;
import com.fullstack.entity.Notice;
import com.fullstack.model.AdminDTO;
import com.fullstack.model.AdminLoginRequestDTO;
import com.fullstack.model.AdminLoginResponseDTO;
import com.fullstack.service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.FaqDTO;
import com.fullstack.model.NoticeDTO;
import com.fullstack.model.SalesSummaryDTO;
import com.fullstack.service.CustomerService;
import com.fullstack.service.FaqService;
import com.fullstack.service.NoticeService;
import com.fullstack.service.SalesService;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import com.fullstack.service.ChatSessionService;
import com.fullstack.model.ChatSessionDTO;
import com.fullstack.model.DailyAnswerCountDTO;
import com.fullstack.model.DailySalesDataDTO;
import com.fullstack.model.InquiryDTO;
import com.fullstack.service.InquiryService;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
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
    private FaqService faqService;

    @Autowired
    private ChatSessionService chatSessionService;

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private SalesService salesService;

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
    public ResponseEntity<Page<AdminDTO>> getAdminList(
            Pageable pageable,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchQuery) {
        Page<AdminDTO> adminPage = adminService.getAdminList(pageable, role, searchType, searchQuery);
        return ResponseEntity.ok(adminPage);
    }

        @GetMapping("/accounts/{id}")
    @PreAuthorize("hasAnyRole('DEV_ADMIN', 'ADMIN', 'ALL_PERMISSION')")
    public ResponseEntity<AdminDTO> getAdminById(@PathVariable Integer id) {
        AdminDTO adminDTO = adminService.getAdminById(id);
        if (adminDTO != null) {
            return ResponseEntity.ok(adminDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

        @GetMapping("/customers")
    public ResponseEntity<Page<CustomerDTO>> getCustomerList(
            Pageable pageable,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchQuery) {
        Page<CustomerDTO> customerPage = customerService.getCustomers(pageable, role, searchType, searchQuery).map(customer -> new CustomerDTO().builder()
                .id(customer.getId())
                .role(customer.getRole())
                .createdAt(customer.getCreatedAt())
                .customName(customer.getCustomName()).build());
        return ResponseEntity.ok(customerPage);
    }

    @GetMapping("/customers/{id}")
    @PreAuthorize("hasAnyRole('DEV_ADMIN', 'ADMIN', 'ALL_PERMISSION', 'MANAGER_COUNSELING')")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable String id) {
        CustomerDTO customerDTO = customerService.getCustomerById(id);
        if (customerDTO != null) {
            return ResponseEntity.ok(customerDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/customers/{id}")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> updateCustomer(@PathVariable String id, @RequestBody CustomerDTO customerDTO) {
        try {
            CustomerDTO updatedCustomer = customerService.updateCustomer(id, customerDTO);
            if (updatedCustomer != null) {
                return ResponseEntity.ok(updatedCustomer);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating customer: " + e.getMessage());
        }
    }

    @DeleteMapping("/customers/{id}")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> deleteCustomer(@PathVariable String id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting customer: " + e.getMessage());
        }
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

    @PutMapping("/accounts/{id}")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> updateAdmin(@PathVariable Integer id, @RequestBody AdminDTO adminDTO) {
        try {
            AdminDTO updatedAdmin = adminService.updateAdmin(id, adminDTO);
            if (updatedAdmin != null) {
                return ResponseEntity.ok(updatedAdmin);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating admin: " + e.getMessage());
        }
    }

    @DeleteMapping("/accounts/{id}")
    @PreAuthorize("hasAuthority('ROLE_DEV_ADMIN') or hasAuthority('ROLE_ALL_PERMISSION')")
    public ResponseEntity<?> deleteAdmin(@PathVariable Integer id) {
        try {
            adminService.deleteAdmin(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting admin: " + e.getMessage());
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

    @GetMapping("/notices/{id}")
    public ResponseEntity<Notice> getNoticeById(@PathVariable Long id) {
        Notice notice = noticeService.getNoticeById(id);
        if (notice != null) {
            return ResponseEntity.ok(notice);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/notices/edit/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<Notice> getNoticeForEdit(@PathVariable Long id) {
        Notice notice = noticeService.getNoticeForEdit(id);
        if (notice != null) {
            return ResponseEntity.ok(notice);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/notices/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> updateNotice(@PathVariable Long id, @RequestBody NoticeDTO noticeDTO) {
        try {
            Notice updatedNotice = noticeService.updateNotice(id, noticeDTO);
            if (updatedNotice != null) {
                return ResponseEntity.ok(updatedNotice);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating notice: " + e.getMessage());
        }
    }

    @DeleteMapping("/notices/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        try {
            noticeService.deleteNotice(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting notice: " + e.getMessage());
        }
    }

    @PatchMapping("/notices/{id}/toggle")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> toggleNoticeActive(@PathVariable Long id) {
        try {
            Notice updatedNotice = noticeService.toggleNoticeActive(id);
            if (updatedNotice != null) {
                return ResponseEntity.ok(updatedNotice);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error toggling notice activation: " + e.getMessage());
        }
    }

    @GetMapping("/faqs")
    public ResponseEntity<List<Faq>> getAllFAQs() {
        List<Faq> faqs = faqService.getAllFAQs();
        return ResponseEntity.ok(faqs);
    }

    @GetMapping("/faqs/{id}")
    public ResponseEntity<Faq> getFaqById(@PathVariable Long id) {
        Faq faq = faqService.getFaqById(id);
        if (faq != null) {
            return ResponseEntity.ok(faq);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/faqs/edit/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<Faq> getFaqForEdit(@PathVariable Long id) {
        Faq faq = faqService.getFaqForEdit(id);
        if (faq != null) {
            return ResponseEntity.ok(faq);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/dashboard/recent-admins/created")
    public ResponseEntity<Page<AdminDTO>> getRecentlyCreatedAdmins(
            Pageable pageable,
            @RequestParam(defaultValue = "1day") String dateRange) {
        Page<AdminDTO> admins = adminService.getRecentlyCreatedAdmins(pageable, dateRange);
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/dashboard/recent-admins/deleted")
    public ResponseEntity<Page<AdminDTO>> getRecentlyDeletedAdmins(
            Pageable pageable,
            @RequestParam(defaultValue = "1day") String dateRange) {
        Page<AdminDTO> admins = adminService.getRecentlyDeletedAdmins(pageable, dateRange);
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/dashboard/recent-customers/created")
    public ResponseEntity<Page<CustomerDTO>> getRecentlyCreatedCustomers(
            Pageable pageable,
            @RequestParam(defaultValue = "1day") String dateRange) {
        Page<CustomerDTO> customers = customerService.getRecentlyCreatedCustomers(pageable, dateRange);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/dashboard/recent-customers/deleted")
    public ResponseEntity<Page<CustomerDTO>> getRecentlyDeletedCustomers(
            Pageable pageable,
            @RequestParam(defaultValue = "1day") String dateRange) {
        Page<CustomerDTO> customers = customerService.getRecentlyDeletedCustomers(pageable, dateRange);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/dashboard/customer-creation-counts")
    public ResponseEntity<Map<String, Long>> getDailyCustomerCreationCounts(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Long> counts = customerService.getDailyCustomerCreationCounts(year, month);
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/dashboard/customer-deletion-counts")
    public ResponseEntity<Map<String, Long>> getDailyCustomerDeletionCounts(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Long> counts = customerService.getDailyCustomerDeletionCounts(year, month);
        return ResponseEntity.ok(counts);
    }

    @PostMapping("/faqs")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> createFAQ(@RequestBody FaqDTO faqDTO) {
        try {
            Faq createdFaq = faqService.createFAQ(faqDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFaq);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating FAQ: " + e.getMessage());
        }
    }

    @PutMapping("/faqs/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> updateFAQ(@PathVariable Long id, @RequestBody FaqDTO faqDTO) {
        try {
            Faq updatedFaq = faqService.updateFAQ(id, faqDTO);
            if (updatedFaq != null) {
                return ResponseEntity.ok(updatedFaq);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating FAQ: " + e.getMessage());
        }
    }

    @DeleteMapping("/faqs/{id}")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> deleteFAQ(@PathVariable Long id) {
        try {
            faqService.deleteFAQ(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting FAQ: " + e.getMessage());
        }
    }

    @PatchMapping("/faqs/{id}/toggle")
    @PreAuthorize("hasRole('MANAGER_COUNSELING') or hasRole('DEV_ADMIN') or hasRole('ALL_PERMISSION')")
    public ResponseEntity<?> toggleFAQActive(@PathVariable Long id) {
        try {
            Faq updatedFaq = faqService.toggleFAQActive(id);
            if (updatedFaq != null) {
                return ResponseEntity.ok(updatedFaq);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error toggling FAQ activation: " + e.getMessage());
        }
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

    @GetMapping("/inquiries/daily-answers")
    public ResponseEntity<List<DailyAnswerCountDTO>> getDailyAnswerCounts(
            @RequestParam int year,
            @RequestParam int month) {
        List<DailyAnswerCountDTO> counts = inquiryService.getDailyAnswerCounts(year, month);
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/inquiries/my-history")
    public ResponseEntity<List<InquiryDTO>> getInquiryDetailsByFilter(
            @RequestParam String filter,
            Authentication authentication) { // Added Authentication
        String adminId = authentication.getName(); // Get adminId from authenticated user
        List<InquiryDTO> inquiries = inquiryService.getInquiryDetailsByFilter(filter, adminId); // Pass adminId
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/sales/daily")
    public ResponseEntity<List<DailySalesDataDTO>> getDailySalesData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailySalesDataDTO> dailySalesData = salesService.getDailySalesData(startDate, endDate);
        return ResponseEntity.ok(dailySalesData);
    }

    @GetMapping("/sales/summary")
    public ResponseEntity<SalesSummaryDTO> getSalesSummary() {
        SalesSummaryDTO salesSummary = salesService.getSalesSummary();
        return ResponseEntity.ok(salesSummary);
    }
}
