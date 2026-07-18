package com.wubebereha.api.repository;

import com.wubebereha.api.domain.Listing;
import com.wubebereha.api.domain.ListingCategory;
import com.wubebereha.api.domain.ListingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    @Query("""
            SELECT l FROM Listing l
            WHERE l.status = :status AND l.category = :category
            AND (:state IS NULL OR l.state = :state)
            ORDER BY l.eventDate ASC NULLS LAST, l.startTime ASC NULLS LAST
            """)
    List<Listing> findApprovedEvents(
            @Param("status") ListingStatus status,
            @Param("category") ListingCategory category,
            @Param("state") String state);

    @Query("""
            SELECT l FROM Listing l
            WHERE l.status = :status AND l.category = :category
            AND (:state IS NULL OR l.state = :state)
            ORDER BY l.title ASC
            """)
    List<Listing> findApprovedNonEvents(
            @Param("status") ListingStatus status,
            @Param("category") ListingCategory category,
            @Param("state") String state);

    List<Listing> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);

    List<Listing> findByStatusOrderByCreatedAtAsc(ListingStatus status);
}
