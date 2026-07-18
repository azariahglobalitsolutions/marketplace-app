package com.wubebereha.api.web.controller;

import com.wubebereha.api.service.AdminService;
import com.wubebereha.api.web.dto.Dto.AdvertiseInquiryRequest;
import com.wubebereha.api.web.dto.Dto.AdvertiseInquiryResponse;
import com.wubebereha.api.web.dto.Dto.TiersResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/advertise")
public class AdvertiseController {

    private final AdminService adminService;

    public AdvertiseController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/tiers")
    public TiersResponse tiers() {
        return adminService.tiers();
    }

    @PostMapping("/inquiry")
    @ResponseStatus(HttpStatus.CREATED)
    public AdvertiseInquiryResponse inquiry(@RequestBody AdvertiseInquiryRequest request) {
        return adminService.inquiry(request);
    }
}
