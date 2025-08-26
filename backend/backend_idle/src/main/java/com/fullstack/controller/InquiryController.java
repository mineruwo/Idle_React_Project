package com.fullstack.controller;

import com.fullstack.model.InquiryDTO;
import com.fullstack.service.InquiryService;
import com.fullstack.model.InquiryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<InquiryDTO> createInquiry(@RequestBody InquiryDTO inquiryDTO) {
        InquiryDTO createdInquiry = inquiryService.createInquiry(inquiryDTO);
        return new ResponseEntity<>(createdInquiry, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDTO> getInquiryById(@PathVariable UUID id) {
        InquiryDTO inquiryDTO = inquiryService.getInquiryById(id);
        return inquiryDTO != null ? ResponseEntity.ok(inquiryDTO) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<Page<InquiryDTO>> getAllInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) InquiryStatus status, // Added status filter
            @RequestParam(required = false) String searchQuery) { // Added search query
        Pageable pageable = PageRequest.of(page, size);
        Page<InquiryDTO> inquiries = inquiryService.getAllInquiries(pageable, status, searchQuery); // Pass new params
        return ResponseEntity.ok(inquiries);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InquiryDTO> updateInquiry(@PathVariable UUID id, @RequestBody InquiryDTO inquiryDTO) {
        InquiryDTO updatedInquiry = inquiryService.updateInquiry(id, inquiryDTO);
        return updatedInquiry != null ? ResponseEntity.ok(updatedInquiry) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable UUID id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Page<InquiryDTO>> getInquiriesByCustomerId(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InquiryDTO> inquiries = inquiryService.getInquiriesByCustomerId(customerId, pageable);
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/customer/{customerId}/recent")
    public ResponseEntity<List<InquiryDTO>> getRecentInquiriesByCustomerId(@PathVariable Long customerId) {
        List<InquiryDTO> inquiries = inquiryService.getRecentInquiriesByCustomerId(customerId);
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<Page<InquiryDTO>> getInquiriesByAdminId(
            @PathVariable String adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InquiryDTO> inquiries = inquiryService.getInquiriesByAdminId(adminId, pageable);
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/daily-counts")
    public ResponseEntity<List<com.fullstack.model.DailyAnswerCountDTO>> getDailyInquiryCounts(
            @RequestParam int year,
            @RequestParam int month) {
        List<com.fullstack.model.DailyAnswerCountDTO> counts = inquiryService.getDailyInquiryCounts(year, month);
        return ResponseEntity.ok(counts);
    }
}
