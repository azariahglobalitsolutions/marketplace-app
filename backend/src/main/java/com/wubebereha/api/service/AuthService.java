package com.wubebereha.api.service;

import com.wubebereha.api.domain.User;
import com.wubebereha.api.repository.UserRepository;
import com.wubebereha.api.security.AuthUser;
import com.wubebereha.api.security.JwtService;
import com.wubebereha.api.util.PhoneUtils;
import com.wubebereha.api.web.dto.Dto.AuthRequest;
import com.wubebereha.api.web.dto.Dto.AuthResponse;
import com.wubebereha.api.web.dto.Dto.MeResponse;
import com.wubebereha.api.web.dto.Dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRequest request) {
        validateCredentials(request);

        String phoneCountry = request.phoneCountry() != null ? request.phoneCountry() : "US";
        String normalizedPhone = PhoneUtils.normalizePhone(request.phone(), phoneCountry);

        if (request.email() != null && userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account already exists with this email or phone");
        }
        if (normalizedPhone != null && userRepository.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account already exists with this email or phone");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPhone(normalizedPhone);
        user.setPhoneCountry(phoneCountry);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(AuthRequest request) {
        validateCredentials(request);

        String phoneCountry = request.phoneCountry() != null ? request.phoneCountry() : "US";
        final String lookupPhone;
        if (request.phone() != null && (request.email() == null || request.email().isBlank())) {
            lookupPhone = PhoneUtils.normalizePhone(request.phone(), phoneCountry);
        } else {
            lookupPhone = request.phone();
        }

        User user = userRepository.findByEmail(request.email())
                .or(() -> lookupPhone != null ? userRepository.findByPhone(lookupPhone) : java.util.Optional.empty())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    public MeResponse me(AuthUser authUser) {
        User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new MeResponse(toUserResponse(user));
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.createToken(user.getId(), user.getEmail(), user.getPhone(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    private UserResponse toUserResponse(User user) {
        String country = user.getPhoneCountry() != null ? user.getPhoneCountry() : "US";
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone() != null ? PhoneUtils.formatPhoneDisplay(user.getPhone(), country) : null,
                country,
                user.getRole().name()
        );
    }

    private void validateCredentials(AuthRequest request) {
        if (request.password() == null || request.password().isBlank()
                || ((request.email() == null || request.email().isBlank())
                && (request.phone() == null || request.phone().isBlank()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone and password are required");
        }
        if (request.password().length() < 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 12 characters");
        }
    }
}
