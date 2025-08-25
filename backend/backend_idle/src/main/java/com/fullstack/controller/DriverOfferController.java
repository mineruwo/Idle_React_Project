// src/main/java/com/fullstack/controller/DriverOfferController.java
package com.fullstack.controller;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.model.OfferAssignRequest;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.service.DriverOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class DriverOfferController {

    private final DriverOfferService driverOfferService;
    private final CustomerRepository customerRepository;

    /**
     * (기사) 입찰 생성
     * - 드라이버 ID는 토큰의 principal에서 꺼냄 (idNum)
     * - driverIdNum이 null이면 401로 응답
     */
    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public DriverOfferResponse create(
            @RequestBody DriverOfferCreateRequest req,
            @AuthenticationPrincipal String userEmail
    ) {
        if (userEmail == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        CustomerEntity driver = customerRepository.findActiveByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("사용자 정보를 찾을 수 없습니다."));

        Integer driverIdNum = driver.getIdNum();
        
        if (driverIdNum == null) {
            // 프론트/인터셉터에서 401 처리하기 좋도록 명확한 상태코드 사용
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        DriverOfferResponse res = null;
        
        try
        {
        	res = driverOfferService.create(req, driverIdNum);        	
        }
        catch (Exception e) {
		 	System.out.println(e.getMessage());
		}
        
        System.out.println(res);
        return res;
    }

    /** (공통) 오더별 입찰 목록 */
    @GetMapping("/order/{orderId}")
    public List<DriverOfferResponse> listByOrder(@PathVariable("orderId") Long orderId) {
        return driverOfferService.listByOrder(orderId);
    }

    /** (화주) 입찰 확정 */
    @PostMapping("/{offerId}/accept")
    public DriverOfferResponse accept(@PathVariable("offerId") Long offerId) {
        return driverOfferService.accept(offerId);
    }

    /**
     * (화주) 기사 직접 선택 → 입찰 생성 + 즉시 확정
     * - 신뢰 기사/사내 기사 바로 배정 시 사용
     */
    @PostMapping("/assign")
    public DriverOfferResponse assign(@RequestBody OfferAssignRequest req) {
        return driverOfferService.assignDirect(req);
    }

    /* ===== 작은 헬퍼 예외 ===== */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    private static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String msg) { super(msg); }
    }
}
