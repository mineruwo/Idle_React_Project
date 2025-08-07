package com.fullstack.repository;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Integer> {

    //차주페이지

    @Query("SELECT c.idNum FROM CustomerEntity c WHERE c.nickname = :nickname")
    Integer findIdNumByNickname(@Param("nickname") String nickname);

    @Query("SELECT c.nickname FROM CustomerEntity c WHERE c.nickname = :nickname")
    String findNickname(@Param("nickname") String nickname);
    
    Optional<CustomerEntity> findByCustomName(String customName);

    
	Optional<CustomerEntity> findById(String id);
	
	Optional<CustomerEntity> findByNickname(String nickname);
	
	boolean existsById(String id);

    boolean existsByNickname(String nickname);
}
