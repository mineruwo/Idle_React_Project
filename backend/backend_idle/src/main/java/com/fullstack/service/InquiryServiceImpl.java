package com.fullstack.service;

import com.fullstack.model.InquiryDTO;
import com.fullstack.model.Inquiry;
import com.fullstack.model.InquiryStatus;
import com.fullstack.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.YearMonth;
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
        Inquiry inquiry = dtoToEntity(inquiryDTO);
        inquiry.setCreatedAt(LocalDateTime.now());
        if (inquiry.getStatus() == null) {
            inquiry.setStatus(InquiryStatus.INQUIRY_PENDING);
        }
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        return entityToDto(savedInquiry);
    }

    @Override
    public InquiryDTO getInquiryById(UUID id) {
        return inquiryRepository.findById(id)
                .map(this::entityToDto)
                .orElse(null);
    }

    @Override
    public Page<InquiryDTO> getAllInquiries(Pageable pageable) {
        return inquiryRepository.findAll(pageable)
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
                    existingInquiry.setAdminIdIndex(inquiryDTO.getAdminIdIndex());
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
    public Page<InquiryDTO> getInquiriesByAdminId(Long adminId, Pageable pageable) {
        // Assuming InquiryRepository has a method findByAdminIdIndex
        return inquiryRepository.findByAdminIdIndex(adminId, pageable)
                .map(this::entityToDto);
    }

    @Override
    public List<DailyAnswerCountDTO> getDailyAnswerCounts(int year, int month) {
        // In a real scenario, this would query the database
        // For now, return mock data
        List<DailyAnswerCountDTO> mockData = new ArrayList<>();
        YearMonth yearMonth = YearMonth.of(year, month);
        int daysInMonth = yearMonth.lengthOfMonth();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 1; i <= daysInMonth; i++) {
            LocalDate date = yearMonth.atDay(i);
            // Simulate some counts
            int count = (int) (Math.random() * 10); // Random count between 0 and 9
            mockData.add(new DailyAnswerCountDTO(date.format(formatter), count));
        }
        return mockData;
    }

    @Override
    public List<InquiryDTO> getInquiryDetailsByFilter(String filter) {
        // In a real scenario, this would query the database
        // For now, return mock data
        List<InquiryDTO> mockInquiries = new ArrayList<>();
        // Add some mock inquiries based on filter
        // Using the actual InquiryDTO fields
        mockInquiries.add(InquiryDTO.builder()
                .inquiryId(UUID.randomUUID())
                .inquiryTitle("상품 문의")
                .status(InquiryStatus.INQUIRY_PENDING)
                .createdAt(LocalDateTime.now().minusDays(5))
                .inquiryAnswer("")
                .build());
        mockInquiries.add(InquiryDTO.builder()
                .inquiryId(UUID.randomUUID())
                .inquiryTitle("배송 문의")
                .status(InquiryStatus.ANSWERED)
                .createdAt(LocalDateTime.now().minusDays(2))
                .inquiryAnswer("배송은 3일 이내 완료됩니다.")
                .build());
        mockInquiries.add(InquiryDTO.builder()
                .inquiryId(UUID.randomUUID())
                .inquiryTitle("환불 문의")
                .status(InquiryStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now().minusDays(1))
                .inquiryAnswer("")
                .build());
        mockInquiries.add(InquiryDTO.builder()
                .inquiryId(UUID.randomUUID())
                .inquiryTitle("기술 지원")
                .status(InquiryStatus.ANSWERED)
                .createdAt(LocalDateTime.now())
                .inquiryAnswer("기술 지원 답변입니다.")
                .build());

        // Filter logic (very basic, needs proper date handling)
        if ("day".equals(filter)) {
            return mockInquiries.stream()
                    .filter(inq -> inq.getCreatedAt().toLocalDate().isEqual(LocalDate.now()))
                    .collect(Collectors.toList());
        } else if ("week".equals(filter)) {
            // Example: last 7 days
            LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
            return mockInquiries.stream()
                    .filter(inq -> inq.getCreatedAt().toLocalDate().isAfter(sevenDaysAgo) || inq.getCreatedAt().toLocalDate().isEqual(sevenDaysAgo))
                    .collect(Collectors.toList());
        } else if ("month".equals(filter)) {
            // Example: current month
            YearMonth currentMonth = YearMonth.now();
            return mockInquiries.stream()
                    .filter(inq -> YearMonth.from(inq.getCreatedAt()).equals(currentMonth))
                    .collect(Collectors.toList());
        } else if ("year".equals(filter)) {
            // Example: current year
            int currentYear = LocalDate.now().getYear();
            return mockInquiries.stream()
                    .filter(inq -> inq.getCreatedAt().getYear() == currentYear)
                    .collect(Collectors.toList());
        } else if ("all".equals(filter)) {
            return mockInquiries;
        }
        return new ArrayList<>();
    }
}
