package com.fullstack.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.TransportAuth;

public interface TransportAuthRepository extends JpaRepository<TransportAuth, String> {

	@Query("SELECT t FROM TransportAuth t WHERE t.idNum = :customerId")
	Optional<TransportAuth> findByCustomerId(@Param("customerId") Integer customerId);
}
