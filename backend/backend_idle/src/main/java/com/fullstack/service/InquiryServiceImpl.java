package com.fullstack.service;

import com.fullstack.model.InquiryDTO;
import com.fullstack.entity.InquiryEntity;
import com.fullstack.model.InquiryStatus;
import com.fullstack.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fullstack.model.DailyAnswerCountDTO;

@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;

    @Override
    public InquiryDTO createInquiry(InquiryDTO inquiryDTO) {
        InquiryEntity inquiry = dtoToEntity(inquiryDTO);
        inquiry.setCreatedAt(LocalDateTime.now());
        if (inquiry.getStatus() == null) {
            inquiry.setStatus(InquiryStatus.INQUIRY_PENDING);
        }
        InquiryEntity savedInquiry = inquiryRepository.save(inquiry);
        return entityToDto(savedInquiry);
    }

    @Override
    public InquiryDTO getInquiryById(UUID id) {
        return inquiryRepository.findById(id)
                .map(this::entityToDto)
                .orElse(null);
    }

    @Override
    public Page<InquiryDTO> getAllInquiries(Pageable pageable, InquiryStatus status, String searchQuery) {
        return inquiryRepository.findAllInquiriesByStatusAndSearchQuery(status, searchQuery, pageable)
                .map(this::entityToDto);
    }

    @Override
    public InquiryDTO updateInquiry(UUID id, InquiryDTO inquiryDTO) {
        return inquiryRepository.findById(id)
                .map(existingInquiry -> {
                    existingInquiry.setInquiryTitle(inquiryDTO.getInquiryTitle());
                    existingInquiry.setInquiryContent(inquiryDTO.getInquiryContent());
                    existingInquiry.setInquiryAnswer(inquiryDTO.getInquiryAnswer());
                    existingInquiry.setAnsweredAt(inquiryDTO.getAnsweredAt());
                    
                    existingInquiry.setAdminId(inquiryDTO.getAdminId());
                    existingInquiry.setStatus(inquiryDTO.getStatus());
                    existingInquiry.setReInquiryId(inquiryDTO.getReInquiryId());
                    return entityToDto(inquiryRepository.save(existingInquiry));
                }).orElse(null);
    }

    @Override
    public void deleteInquiry(UUID id) {
        inquiryRepository.deleteById(id);
    }

    @Override
    public Page<InquiryDTO> getInquiriesByCustomerId(Long customerId, Pageable pageable) {
        // Assuming InquiryRepository has a method findByCustomerIdNum
        return inquiryRepository.findByCustomerIdNum(customerId, pageable)
                .map(this::entityToDto);
    }

    @Override
    public Page<InquiryDTO> getInquiriesByAdminId(String adminId, Pageable pageable) {
        // Assuming InquiryRepository has a method findByAdminId
        return inquiryRepository.findByAdminId(adminId, pageable)
                .map(this::entityToDto);
    }

    @Override
    public List<DailyAnswerCountDTO> getDailyAnswerCounts(int year, int month) {
        List<Object[]> results = inquiryRepository.countDailyAnsweredInquiriesByMonth(year, month);
        List<DailyAnswerCountDTO> dailyCounts = new ArrayList<>();
        for (Object[] result : results) {
            String date = (String) result[0];
            Long count = (Long) result[1];
            dailyCounts.add(new DailyAnswerCountDTO(date, count.intValue()));
        }
        return dailyCounts;
    }

    @Override
    public List<DailyAnswerCountDTO> getDailyInquiryCounts(int year, int month) {
        List<Object[]> results = inquiryRepository.countDailyCreatedInquiriesByMonth(year, month);
        List<DailyAnswerCountDTO> dailyCounts = new ArrayList<>();
        for (Object[] result : results) {
            String date = (String) result[0];
            Long count = (Long) result[1];
            dailyCounts.add(new DailyAnswerCountDTO(date, count.intValue()));
        }
        return dailyCounts;
    }

    @Override
    public List<InquiryDTO> getInquiryDetailsByFilter(String filter, String adminId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();
        LocalDateTime sevenDaysAgo = today.minusDays(7).atStartOfDay();
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();
        String currentDate = today.format(DateTimeFormatter.ofPattern("YYYY-MM-dd"));

        List<InquiryEntity> inquiries = inquiryRepository.findInquiriesByFilter(
                filter,
                currentDate,
                sevenDaysAgo,
                now,
                currentYear,
                currentMonth,
                adminId // Pass adminId to repository
        );

        return inquiries.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InquiryDTO> getRecentInquiriesByCustomerId(Long customerId) {
        return inquiryRepository.findTop5ByCustomerIdNumOrderByCreatedAtDesc(customerId).stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }
}
