package com.fullstack.idle.service.inquiry;

import com.fullstack.idle.dto.inquiry.InquiryDTO;
import com.fullstack.idle.model.inquiry.Inquiry;
import com.fullstack.idle.model.inquiry.InquiryStatus;
import com.fullstack.idle.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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
}
