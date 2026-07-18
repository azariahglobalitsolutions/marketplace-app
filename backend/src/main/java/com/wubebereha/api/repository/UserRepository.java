package com.wubebereha.api.repository;

import com.wubebereha.api.domain.User;
import com.wubebereha.api.domain.UserRole;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findFirstByRole(UserRole role);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByRole(UserRole role);
}
