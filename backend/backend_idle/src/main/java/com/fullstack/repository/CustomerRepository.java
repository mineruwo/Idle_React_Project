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
	
	//차주 페이지 로그인id로 조회
	@Query("select c from CustomerEntity c where c.id = :loginId")
	Optional<CustomerEntity>findByLoginId(@Param("loginId") String loginId);
  
	// 닉네임 중복(본인 제외) 체크
    @Query("""
        select case when count(c) > 0 then true else false end
        from CustomerEntity c
        where c.nickname = :nickname
          and c.id <> :loginId
    """)
    boolean existsByNicknameAndLoginIdNot(@Param("nickname") String nickname,
                                          @Param("loginId") String loginId);
    
    @Query("select c.nickname from CustomerEntity c where c.id = :ownerId")
    Optional<String> findNicknameByOwnerId(@Param("ownerId") String ownerId);
	
	


    
	Optional<CustomerEntity> findById(String id);
	
	Optional<CustomerEntity> findByNickname(String nickname);
	
	
	boolean existsById(String id);

    boolean existsByNickname(String nickname);
    
    boolean existsByNicknameAndIdNot(String nickname, String id);
}
