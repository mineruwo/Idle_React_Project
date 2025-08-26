package com.fullstack.service;

import com.fullstack.model.InquiryDTO;
import com.fullstack.model.Inquiry;
import com.fullstack.model.DailyAnswerCountDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface InquiryService {
    InquiryDTO createInquiry(InquiryDTO inquiryDTO);
    InquiryDTO getInquiryById(UUID id);
    Page<InquiryDTO> getAllInquiries(Pageable pageable);
    InquiryDTO updateInquiry(UUID id, InquiryDTO inquiryDTO);
    void deleteInquiry(UUID id);
    Page<InquiryDTO> getInquiriesByCustomerId(Long customerId, Pageable pageable);
    Page<InquiryDTO> getInquiriesByAdminId(Long adminId, Pageable pageable);

    List<DailyAnswerCountDTO> getDailyAnswerCounts(int year, int month);
    List<InquiryDTO> getInquiryDetailsByFilter(String filter);

    default Inquiry dtoToEntity(InquiryDTO dto) {
        return Inquiry.builder()
                .inquiryId(dto.getInquiryId())
                .customerIdNum(dto.getCustomerIdNum())
                .inquiryTitle(dto.getInquiryTitle())
                .inquiryContent(dto.getInquiryContent())
                .inquiryAnswer(dto.getInquiryAnswer())
                .createdAt(dto.getCreatedAt())
                .answeredAt(dto.getAnsweredAt())
                .adminIdIndex(dto.getAdminIdIndex())
                .adminId(dto.getAdminId())
                .status(dto.getStatus())
                .reInquiryId(dto.getReInquiryId())
                .build();
    }

    default InquiryDTO entityToDto(Inquiry entity) {
        return InquiryDTO.builder()
                .inquiryId(entity.getInquiryId())
                .customerIdNum(entity.getCustomerIdNum())
                .inquiryTitle(entity.getInquiryTitle())
                .inquiryContent(entity.getInquiryContent())
                .inquiryAnswer(entity.getInquiryAnswer())
                .createdAt(entity.getCreatedAt())
                .answeredAt(entity.getAnsweredAt())
                .adminIdIndex(entity.getAdminIdIndex())
                .adminId(entity.getAdminId())
                .status(entity.getStatus())
                .reInquiryId(entity.getReInquiryId())
                .build();
    }
}
