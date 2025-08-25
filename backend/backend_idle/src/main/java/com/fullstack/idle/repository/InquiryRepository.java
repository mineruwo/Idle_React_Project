package com.fullstack.idle.repository;

import com.fullstack.idle.model.inquiry.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {
    Page<Inquiry> findByCustomerIdNum(Long customerIdNum, Pageable pageable);
    Page<Inquiry> findByAdminIdIndex(Long adminIdIndex, Pageable pageable);
}
