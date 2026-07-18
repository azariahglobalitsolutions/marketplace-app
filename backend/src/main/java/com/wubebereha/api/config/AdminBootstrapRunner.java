package com.wubebereha.api.config;

import com.wubebereha.api.domain.User;
import com.wubebereha.api.domain.UserRole;
import com.wubebereha.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRole(UserRole.admin)) {
            return;
        }

        String email = environment.getProperty("ADMIN_EMAIL");
        String password = environment.getProperty("ADMIN_PASSWORD");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.warn(
                    "No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set. "
                            + "Admin routes will be unavailable until an admin account is created."
            );
            return;
        }

        if (password.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 12 characters");
        }

        User admin = new User();
        admin.setEmail(email.trim());
        admin.setPhoneCountry("US");
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.admin);
        userRepository.save(admin);
        log.info("Created bootstrap admin account for {}", email.trim());
    }
}
