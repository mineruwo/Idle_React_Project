// com.fullstack.controller.DriverOfferController
package com.fullstack.controller;

import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.service.DriverOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DriverOfferController {

    private final DriverOfferService driverOfferService;

    @PostMapping
    public ResponseEntity<DriverOfferResponse> create(@RequestBody DriverOfferCreateRequest req){
        return ResponseEntity.ok(driverOfferService.create(req));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<DriverOfferResponse>> list(@PathVariable Long orderId){
        return ResponseEntity.ok(driverOfferService.listByOrder(orderId));
    }

    @PostMapping("/{offerId}/accept")
    public ResponseEntity<DriverOfferResponse> accept(@PathVariable Long offerId){
        return ResponseEntity.ok(driverOfferService.accept(offerId));
    }

    // ✅ 오더 상세에서 "기사제안가만" 보여줄 때 이거 호출하면 끝
    @GetMapping("/order/{orderId}/driver-price")
    public ResponseEntity<Long> getDriverPrice(@PathVariable Long orderId){
        return ResponseEntity.ok(driverOfferService.getDriverPriceByOrderId(orderId));
    }
}
