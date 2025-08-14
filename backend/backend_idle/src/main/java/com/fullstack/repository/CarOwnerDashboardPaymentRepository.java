package com.fullstack.repository;

import com.fullstack.entity.PaymentEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CarOwnerDashboardPaymentRepository extends JpaRepository<PaymentEntity, Long> {

	 @Query("""
		        select function('to_char', p.paidAt, 'YYYY-MM-DD') as day, sum(p.amount) as sum
		        from PaymentEntity p
		        where p.customer.id = :ownerId
		          and p.paymentStatus = 'PAID'
		          and p.paidAt between :start and :end
		        group by function('to_char', p.paidAt, 'YYYY-MM-DD')
		        order by day
		    """)
		    List<Object[]> sumDailyRevenue(
		            @Param("ownerId") String ownerId,
		            @Param("start") LocalDateTime start,
		            @Param("end") LocalDateTime end);

		    @Query("""
		        select coalesce(sum(p.amount), 0)
		        from PaymentEntity p
		        where p.customer.id = :ownerId
		          and p.paymentStatus = 'PAID'
		          and p.paidAt between :start and :end
		    """)
		    Long sumMonthlyRevenue(
		            @Param("ownerId") String ownerId,
		            @Param("start") LocalDateTime start,
		            @Param("end") LocalDateTime end);
}
