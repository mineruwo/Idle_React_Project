package com.fullstack.repository;

import com.fullstack.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    // 특정 대상(차주)에 대한 모든 리뷰를 조회
    List<ReviewEntity> findByTarget_IdNum(Integer targetId);

    // 특정 작성자(화주)가 작성한 모든 리뷰를 조회
    List<ReviewEntity> findByAuthor_IdNum(Integer authorId);
}
