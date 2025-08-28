package com.fullstack.repository;

import com.fullstack.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    // 특정 대상(차주)에 대한 모든 리뷰를 조회
    List<ReviewEntity> findByTarget_IdNum(Integer targetId);

    // 특정 작성자(화주)가 작성한 모든 리뷰를 조회
    List<ReviewEntity> findByAuthor_IdNum(Integer authorId);
    
 // 드라이버(idNum)를 타겟으로 받은 리뷰 개수
    @Query("select count(r) from ReviewEntity r where r.target.idNum = :driverId")
    long countByTargetIdNum(@Param("driverId") Integer driverId);

    // 드라이버(idNum)를 타겟으로 받은 평균 평점 (nullable)
    @Query("select avg(r.rating) from ReviewEntity r where r.target.idNum = :driverId")
    Double avgRatingByTargetIdNum(@Param("driverId") Integer driverId);
}
