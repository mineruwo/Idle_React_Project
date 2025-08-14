// src/main/java/com/fullstack/controller/DriverOfferController.java
package com.fullstack.controller;

import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.model.OfferAssignRequest;
import com.fullstack.service.DriverOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class DriverOfferController {

    private final DriverOfferService driverOfferService;

    /** (기사) 입찰 생성: 로그인 사용자에서 idNum 추출 */
    @PostMapping
    public DriverOfferResponse create(
            @RequestBody DriverOfferCreateRequest req,
            @AuthenticationPrincipal(expression = "idNum") Integer driverIdNum
    ){
        return driverOfferService.create(req, driverIdNum);
    }

    /** (공통) 오더별 입찰 목록 */
    @GetMapping("/order/{orderId}")
    public List<DriverOfferResponse> listByOrder(@PathVariable Long orderId){
        return driverOfferService.listByOrder(orderId);
    }

    /** (화주) 입찰 확정 */
    @PostMapping("/{offerId}/accept")
    public DriverOfferResponse accept(@PathVariable Long offerId){
        return driverOfferService.accept(offerId);
    }

    /** (화주) 기사 선택 → 등록+배정 한 번에 */
    @PostMapping("/assign")
    public DriverOfferResponse assign(@RequestBody OfferAssignRequest req){
        // 필요시 권한 제한:
        // @PreAuthorize("hasAnyRole('ADMIN','SHIPPER')")
        return driverOfferService.assignDirect(req);
    }
}
