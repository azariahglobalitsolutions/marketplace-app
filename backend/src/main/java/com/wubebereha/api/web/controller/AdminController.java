package com.wubebereha.api.web.controller;

import com.wubebereha.api.service.AdminService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/pending")
    public Map<String, Object> pending() {
        return adminService.pendingListings();
    }

    @PostMapping("/{listingId}/approve")
    public Map<String, Object> approve(@PathVariable Long listingId) {
        return adminService.approve(listingId);
    }

    @PostMapping("/{listingId}/reject")
    public Map<String, Object> reject(@PathVariable Long listingId) {
        return adminService.reject(listingId);
    }

    @GetMapping("/ad-inquiries")
    public Map<String, Object> adInquiries() {
        return adminService.adInquiries();
    }
}
