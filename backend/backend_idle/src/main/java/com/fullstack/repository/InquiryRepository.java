package com.fullstack.repository;

import com.fullstack.entity.InquiryEntity;
import com.fullstack.model.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface InquiryRepository extends JpaRepository<InquiryEntity, UUID> {
    Page<InquiryEntity> findByCustomerIdNum(Long customerIdNum, Pageable pageable);
    List<InquiryEntity> findTop5ByCustomerIdNumOrderByCreatedAtDesc(Long customerIdNum);
    Page<InquiryEntity> findByAdminId(String adminId, Pageable pageable);
    

    @Query("SELECT FUNCTION('TO_CHAR', i.answeredAt, 'YYYY-MM-DD'), COUNT(i) " +
           "FROM InquiryEntity i " +
           "WHERE YEAR(i.answeredAt) = :year " +
           "AND MONTH(i.answeredAt) = :month " +
           "AND i.status = com.fullstack.model.InquiryStatus.ANSWERED " +
           "GROUP BY FUNCTION('TO_CHAR', i.answeredAt, 'YYYY-MM-DD') " +
           "ORDER BY FUNCTION('TO_CHAR', i.answeredAt, 'YYYY-MM-DD')")
    List<Object[]> countDailyAnsweredInquiriesByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM-DD'), COUNT(i) " +
           "FROM InquiryEntity i " +
           "WHERE YEAR(i.createdAt) = :year " +
           "AND MONTH(i.createdAt) = :month " +
           "GROUP BY FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM-DD') " +
           "ORDER BY FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM-DD')")
    List<Object[]> countDailyCreatedInquiriesByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT i FROM InquiryEntity i " +
           "WHERE (:filter = 'all' OR " +
           "(:filter = 'day' AND FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM-DD') = :currentDate) OR " +
           "(:filter = 'week' AND i.createdAt >= :sevenDaysAgo AND i.createdAt <= :now) OR " +
           "(:filter = 'month' AND YEAR(i.createdAt) = :currentYear AND MONTH(i.createdAt) = :currentMonth) OR " +
           "(:filter = 'year' AND YEAR(i.createdAt) = :currentYear)) " +
           "AND (:adminId IS NULL OR i.adminId = :adminId) " + // Added adminId filter
           "ORDER BY i.createdAt DESC")
    List<InquiryEntity> findInquiriesByFilter(
            @Param("filter") String filter,
            @Param("currentDate") String currentDate,
            @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo,
            @Param("now") LocalDateTime now,
            @Param("currentYear") Integer currentYear,
            @Param("currentMonth") Integer currentMonth,
            @Param("adminId") String adminId);

    @Query("SELECT i FROM InquiryEntity i " +
           "WHERE (:status IS NULL OR i.status = :status) " +
           "AND (:searchQuery IS NULL OR " +
           "CAST(i.inquiryId AS text) LIKE CONCAT('%', CAST(:searchQuery AS text), '%') OR " + // Search by inquiry ID
           "LOWER(i.inquiryTitle) LIKE LOWER(CONCAT('%', CAST(:searchQuery AS text), '%')) OR " +
           "CAST(i.customerIdNum AS text) LIKE CONCAT('%', CAST(:searchQuery AS text), '%')) " + // Search by customer ID
           "ORDER BY i.createdAt DESC")
    Page<InquiryEntity> findAllInquiriesByStatusAndSearchQuery(
            @Param("status") com.fullstack.model.InquiryStatus status,
            @Param("searchQuery") String searchQuery,
            Pageable pageable); // Added adminId parameter
}

