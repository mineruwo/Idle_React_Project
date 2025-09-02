package com.fullstack.service;

import com.fullstack.model.InquiryDTO;
import com.fullstack.entity.InquiryEntity;
import com.fullstack.model.DailyAnswerCountDTO;
import com.fullstack.model.InquiryStatus;
import com.fullstack.entity.AdminEntity; // Added
import com.fullstack.entity.CustomerEntity; // Added
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface InquiryService {
    InquiryDTO createInquiry(InquiryDTO inquiryDTO);
    InquiryDTO getInquiryById(UUID id);
    Page<InquiryDTO> getAllInquiries(Pageable pageable, InquiryStatus status, String searchQuery);
    InquiryDTO updateInquiry(UUID id, InquiryDTO inquiryDTO);
    void deleteInquiry(UUID id);
    Page<InquiryDTO> getInquiriesByCustomerId(Long customerId, Pageable pageable);
    Page<InquiryDTO> getInquiriesByAdminId(String adminId, Pageable pageable);

    List<InquiryDTO> getRecentInquiriesByCustomerId(Long customerId);

    List<DailyAnswerCountDTO> getDailyAnswerCounts(int year, int month);
    List<DailyAnswerCountDTO> getDailyInquiryCounts(int year, int month);
    List<InquiryDTO> getInquiryDetailsByFilter(String filter, String adminId);

    default InquiryEntity dtoToEntity(InquiryDTO dto) {
        return InquiryEntity.builder()
                .inquiryId(dto.getInquiryId())
                .customer(CustomerEntity.builder().idNum(dto.getCustomerIdNum().intValue()).build())
                .inquiryTitle(dto.getInquiryTitle())
                .inquiryContent(dto.getInquiryContent())
                .inquiryAnswer(dto.getInquiryAnswer())
                .createdAt(dto.getCreatedAt())
                .answeredAt(dto.getAnsweredAt())
                
                
                .status(dto.getStatus())
                .reInquiryId(dto.getReInquiryId())
                .build();
    }

    default InquiryDTO entityToDto(InquiryEntity entity) {
        return InquiryDTO.builder()
                .inquiryId(entity.getInquiryId())
                .customerIdNum(entity.getCustomer() != null ? entity.getCustomer().getIdNum().longValue() : null)
                .inquiryTitle(entity.getInquiryTitle())
                .inquiryContent(entity.getInquiryContent())
                .inquiryAnswer(entity.getInquiryAnswer())
                .createdAt(entity.getCreatedAt())
                .answeredAt(entity.getAnsweredAt())
                
                .adminId(entity.getAdmin() != null ? entity.getAdmin().getAdminId() : null)
                .status(entity.getStatus())
                .reInquiryId(entity.getReInquiryId())
                .build();
    }
}
