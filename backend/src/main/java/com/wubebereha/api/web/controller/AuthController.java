package com.wubebereha.api.web.controller;

import com.wubebereha.api.security.AuthUser;
import com.wubebereha.api.security.SecurityUtils;
import com.wubebereha.api.service.AuthService;
import com.wubebereha.api.web.dto.Dto.AuthRequest;
import com.wubebereha.api.web.dto.Dto.AuthResponse;
import com.wubebereha.api.web.dto.Dto.MeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    public AuthController(AuthService authService, SecurityUtils securityUtils) {
        this.authService = authService;
        this.securityUtils = securityUtils;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me() {
        AuthUser user = securityUtils.currentUser();
        return authService.me(user);
    }
}
