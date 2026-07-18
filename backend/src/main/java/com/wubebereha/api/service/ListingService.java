package com.wubebereha.api.service;

import com.wubebereha.api.domain.Listing;
import com.wubebereha.api.domain.ListingCategory;
import com.wubebereha.api.domain.ListingStatus;
import com.wubebereha.api.domain.User;
import com.wubebereha.api.domain.UserRole;
import com.wubebereha.api.repository.ListingRepository;
import com.wubebereha.api.repository.UserRepository;
import com.wubebereha.api.security.AuthUser;
import com.wubebereha.api.security.SecurityUtils;
import com.wubebereha.api.util.CategoryCatalog;
import com.wubebereha.api.util.PhoneUtils;
import com.wubebereha.api.web.dto.Dto.ListingResponse;
import com.wubebereha.api.web.dto.Dto.ListingsResponse;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ListingService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final UploadService uploadService;

    public ListingService(
            ListingRepository listingRepository,
            UserRepository userRepository,
            SecurityUtils securityUtils,
            UploadService uploadService
    ) {
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
        this.uploadService = uploadService;
    }

    public ListingsResponse listListings(String categoryValue, String state) {
        if (!CategoryCatalog.isValidCategory(categoryValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
        }

        ListingCategory category = ListingCategory.valueOf(categoryValue);
        String normalizedState = (state == null || state.isBlank()) ? null : state;
        List<Listing> listings = category == ListingCategory.events
                ? listingRepository.findApprovedEvents(ListingStatus.approved, category, normalizedState)
                : listingRepository.findApprovedNonEvents(ListingStatus.approved, category, normalizedState);

        AuthUser currentUser = securityUtils.currentUserOrNull();
        boolean includeContact = currentUser != null;
        List<ListingResponse> responses = listings.stream()
                .map(listing -> toResponse(listing, includeContact))
                .toList();

        Map<String, List<ListingResponse>> grouped = new LinkedHashMap<>();
        if (category == ListingCategory.events) {
            for (ListingResponse listing : responses) {
                String key = listing.eventDate() != null ? listing.eventDate() : "Unscheduled";
                grouped.computeIfAbsent(key, ignored -> new java.util.ArrayList<>()).add(listing);
            }
        } else {
            grouped.put("all", responses);
        }

        return new ListingsResponse(responses, grouped, categoryValue, state);
    }

    public ListingResponse getListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        AuthUser currentUser = securityUtils.currentUserOrNull();
        if (listing.getStatus() != ListingStatus.approved) {
            boolean allowed = currentUser != null
                    && (currentUser.getId().equals(listing.getOrganizer().getId())
                    || currentUser.getRole() == UserRole.admin);
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found");
            }
        }

        return toResponse(listing, currentUser != null);
    }

    public List<ListingResponse> myListings(Long userId) {
        return listingRepository.findByOrganizerIdOrderByCreatedAtDesc(userId).stream()
                .map(listing -> toResponse(listing, true))
                .toList();
    }

    public ListingResponse createListing(
            AuthUser authUser,
            String categoryValue,
            String title,
            String description,
            String state,
            String city,
            String venue,
            String eventDate,
            String startTime,
            String endTime,
            String contactEmail,
            String contactPhone,
            String contactPhoneCountry,
            MultipartFile picture,
            MultipartFile logo,
            MultipartFile attachment
    ) {
        if (!CategoryCatalog.isValidCategory(categoryValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
        }
        if (title == null || description == null || state == null || city == null
                || title.isBlank() || description.isBlank() || state.isBlank() || city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, description, state, and city are required");
        }
        if (!CategoryCatalog.isValidState(state)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid US state");
        }

        ListingCategory category = ListingCategory.valueOf(categoryValue);
        if (category == ListingCategory.events && (eventDate == null || eventDate.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event date is required for events");
        }

        User organizer = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));

        String phoneCountry = contactPhoneCountry != null && !contactPhoneCountry.isBlank()
                ? contactPhoneCountry
                : organizer.getPhoneCountry();
        String normalizedPhone = PhoneUtils.normalizePhone(
                contactPhone != null ? contactPhone : organizer.getPhone(),
                phoneCountry
        );

        UploadService.UploadResult image = uploadService.saveImage(picture, "picture");
        UploadService.UploadResult logoUpload = uploadService.saveImage(logo, "logo");
        UploadService.UploadResult attachmentUpload = uploadService.saveAttachment(attachment, "attachment");

        Listing listing = new Listing();
        listing.setCategory(category);
        listing.setTitle(title);
        listing.setDescription(description);
        listing.setState(state);
        listing.setCity(city);
        listing.setVenue(venue);
        if (eventDate != null && !eventDate.isBlank()) {
            listing.setEventDate(java.time.LocalDate.parse(eventDate));
        }
        listing.setStartTime(startTime);
        listing.setEndTime(endTime);
        listing.setOrganizer(organizer);
        listing.setContactEmail(contactEmail != null ? contactEmail : organizer.getEmail());
        listing.setContactPhone(normalizedPhone);
        listing.setContactPhoneCountry(phoneCountry);
        listing.setImageUrl(image.url());
        listing.setLogoUrl(logoUpload.url());
        listing.setAttachmentUrl(attachmentUpload.url());
        listing.setAttachmentName(attachmentUpload.originalName());
        listing.setStatus(ListingStatus.pending);

        Listing saved = listingRepository.save(listing);
        return toResponse(saved, true);
    }

    public ListingResponse toResponse(Listing listing, boolean includeContact) {
        String country = listing.getContactPhoneCountry() != null ? listing.getContactPhoneCountry() : "US";
        return new ListingResponse(
                listing.getId(),
                listing.getCategory().name(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getState(),
                listing.getCity(),
                listing.getVenue(),
                listing.getEventDate() != null ? listing.getEventDate().format(DATE_FORMAT) : null,
                listing.getStartTime(),
                listing.getEndTime(),
                listing.getImageUrl(),
                listing.getLogoUrl(),
                listing.getAttachmentUrl(),
                listing.getAttachmentName(),
                country,
                listing.getStatus().name(),
                listing.getCreatedAt() != null ? listing.getCreatedAt().toString() : null,
                includeContact ? listing.getContactEmail() : null,
                includeContact ? PhoneUtils.formatPhoneDisplay(listing.getContactPhone(), country) : null,
                includeContact ? PhoneUtils.phoneToTelLink(listing.getContactPhone(), country) : null
        );
    }
}
