package com.wubebereha.api.service;

import com.wubebereha.api.domain.AdInquiry;
import com.wubebereha.api.domain.Listing;
import com.wubebereha.api.domain.ListingStatus;
import com.wubebereha.api.repository.AdInquiryRepository;
import com.wubebereha.api.repository.ListingRepository;
import com.wubebereha.api.service.ListingService;
import com.wubebereha.api.util.CategoryCatalog;
import com.wubebereha.api.util.PhoneUtils;
import com.wubebereha.api.util.PricingTiers;
import com.wubebereha.api.web.dto.Dto.AdvertiseInquiryRequest;
import com.wubebereha.api.web.dto.Dto.AdvertiseInquiryResponse;
import com.wubebereha.api.web.dto.Dto.ListingResponse;
import com.wubebereha.api.web.dto.Dto.TiersResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminService {

    private final ListingRepository listingRepository;
    private final AdInquiryRepository adInquiryRepository;
    private final ListingService listingService;

    public AdminService(
            ListingRepository listingRepository,
            AdInquiryRepository adInquiryRepository,
            ListingService listingService
    ) {
        this.listingRepository = listingRepository;
        this.adInquiryRepository = adInquiryRepository;
        this.listingService = listingService;
    }

    public Map<String, Object> pendingListings() {
        List<Map<String, Object>> rows = listingRepository.findByStatusOrderByCreatedAtAsc(ListingStatus.pending)
                .stream()
                .map(this::toAdminRow)
                .toList();
        Map<String, Object> response = new HashMap<>();
        response.put("listings", rows);
        response.put("events", rows);
        return response;
    }

    public Map<String, Object> approve(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        listing.setStatus(ListingStatus.approved);
        Listing updated = listingRepository.save(listing);
        return actionResponse("Listing approved", updated);
    }

    public Map<String, Object> reject(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        listing.setStatus(ListingStatus.rejected);
        Listing updated = listingRepository.save(listing);
        return actionResponse("Listing rejected", updated);
    }

    public Map<String, Object> adInquiries() {
        return Map.of("inquiries", adInquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    public TiersResponse tiers() {
        return new TiersResponse(PricingTiers.TIERS);
    }

    public AdvertiseInquiryResponse inquiry(AdvertiseInquiryRequest request) {
        if (request.name() == null || request.email() == null || request.tier() == null
                || request.name().isBlank() || request.email().isBlank() || request.tier().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email, and tier are required");
        }
        if (!PricingTiers.isValidTier(request.tier())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pricing tier");
        }

        AdInquiry inquiry = new AdInquiry();
        inquiry.setName(request.name());
        inquiry.setEmail(request.email());
        inquiry.setPhone(request.phone());
        inquiry.setTier(request.tier());
        inquiry.setMessage(request.message());
        AdInquiry saved = adInquiryRepository.save(inquiry);

        return new AdvertiseInquiryResponse(
                "Your advertising inquiry has been received. We will contact you shortly.",
                saved.getId()
        );
    }

    private Map<String, Object> actionResponse(String message, Listing listing) {
        ListingResponse listingResponse = listingService.toResponse(listing, true);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("listing", listingResponse);
        response.put("event", listingResponse);
        return response;
    }

    private Map<String, Object> toAdminRow(Listing listing) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", listing.getId());
        row.put("category", listing.getCategory().name());
        row.put("category_label", CategoryCatalog.CATEGORIES.get(listing.getCategory().name()));
        row.put("title", listing.getTitle());
        row.put("description", listing.getDescription());
        row.put("state", listing.getState());
        row.put("city", listing.getCity());
        row.put("venue", listing.getVenue());
        row.put("event_date", listing.getEventDate() != null ? listing.getEventDate().toString() : null);
        row.put("start_time", listing.getStartTime());
        row.put("end_time", listing.getEndTime());
        row.put("status", listing.getStatus().name());
        row.put("created_at", listing.getCreatedAt() != null ? listing.getCreatedAt().toString() : null);
        row.put("contact_email", listing.getContactEmail());
        row.put("contact_phone", listing.getContactPhone());
        row.put("contact_phone_country", listing.getContactPhoneCountry());
        row.put("organizer_email", listing.getOrganizer().getEmail());
        row.put("organizer_phone", listing.getOrganizer().getPhone());
        row.put("organizer_phone_country", listing.getOrganizer().getPhoneCountry());

        String country = listing.getContactPhoneCountry() != null ? listing.getContactPhoneCountry() : "US";
        if (listing.getContactPhone() != null) {
            row.put("contact_phone_display", PhoneUtils.formatPhoneDisplay(listing.getContactPhone(), country));
        }
        String orgCountry = listing.getOrganizer().getPhoneCountry() != null
                ? listing.getOrganizer().getPhoneCountry() : "US";
        if (listing.getOrganizer().getPhone() != null) {
            row.put("organizer_phone_display", PhoneUtils.formatPhoneDisplay(listing.getOrganizer().getPhone(), orgCountry));
        }
        return row;
    }
}
