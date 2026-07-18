package com.wubebereha.api.repository;

import com.wubebereha.api.domain.AdInquiry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdInquiryRepository extends JpaRepository<AdInquiry, Long> {

    List<AdInquiry> findAllByOrderByCreatedAtDesc();
}
