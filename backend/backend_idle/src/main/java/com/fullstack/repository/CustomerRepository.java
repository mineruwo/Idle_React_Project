package com.fullstack.repository;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Integer> {
    CustomerDTO findById(String id);
    
    
    
    
    
    
    
    
    //차주페이지 꺼임 건들지마셈! 
    @Query("SELECT c.idNum FROM CustomerEntity c WHERE c.nickname = :nickname")
    Integer findIdNumByNickname(@Param("nickname") String nickname);

    @Query("SELECT c.nickname FROM CustomerEntity c WHERE c.nickname = :nickname")
    String findNickname(@Param("nickname") String nickname);
}
