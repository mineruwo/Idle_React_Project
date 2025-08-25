package com.fullstack.idle.service.inquiry;

import com.fullstack.idle.dto.inquiry.InquiryDTO;
import com.fullstack.idle.model.inquiry.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InquiryService {
    InquiryDTO createInquiry(InquiryDTO inquiryDTO);
    InquiryDTO getInquiryById(UUID id);
    Page<InquiryDTO> getAllInquiries(Pageable pageable);
    InquiryDTO updateInquiry(UUID id, InquiryDTO inquiryDTO);
    void deleteInquiry(UUID id);
    Page<InquiryDTO> getInquiriesByCustomerId(Long customerId, Pageable pageable);
    Page<InquiryDTO> getInquiriesByAdminId(Long adminId, Pageable pageable);

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
