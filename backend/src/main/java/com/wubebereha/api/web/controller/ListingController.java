package com.wubebereha.api.web.controller;

import com.wubebereha.api.security.AuthUser;
import com.wubebereha.api.security.SecurityUtils;
import com.wubebereha.api.service.ListingService;
import com.wubebereha.api.util.CategoryCatalog;
import com.wubebereha.api.web.dto.Dto.CategoriesResponse;
import com.wubebereha.api.web.dto.Dto.CreateListingResponse;
import com.wubebereha.api.web.dto.Dto.ListingDetailResponse;
import com.wubebereha.api.web.dto.Dto.ListingResponse;
import com.wubebereha.api.web.dto.Dto.ListingsResponse;
import com.wubebereha.api.web.dto.Dto.StatesResponse;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;
    private final SecurityUtils securityUtils;

    public ListingController(ListingService listingService, SecurityUtils securityUtils) {
        this.listingService = listingService;
        this.securityUtils = securityUtils;
    }

    @GetMapping(value = {"", "/"})
    public ListingsResponse listListings(
            @RequestParam(defaultValue = "events") String category,
            @RequestParam(required = false) String state
    ) {
        return listingService.listListings(category, state);
    }

    @GetMapping("/categories")
    public CategoriesResponse categories() {
        return new CategoriesResponse(CategoryCatalog.categoryList());
    }

    @GetMapping("/states")
    public StatesResponse states() {
        return new StatesResponse(CategoryCatalog.US_STATES);
    }

    @GetMapping("/my")
    public Map<String, List<ListingResponse>> myListings() {
        AuthUser user = securityUtils.currentUser();
        return Map.of("listings", listingService.myListings(user.getId()));
    }

    @GetMapping("/{listingId}")
    public ListingDetailResponse getListing(@PathVariable Long listingId) {
        return new ListingDetailResponse(listingService.getListing(listingId));
    }

    @PostMapping(value = {"", "/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CreateListingResponse createListingMultipart(
            @RequestPart(required = false) String category,
            @RequestPart String title,
            @RequestPart String description,
            @RequestPart String state,
            @RequestPart String city,
            @RequestPart(required = false) String venue,
            @RequestPart(required = false) String event_date,
            @RequestPart(required = false) String start_time,
            @RequestPart(required = false) String end_time,
            @RequestPart(required = false) String contact_email,
            @RequestPart(required = false) String contact_phone,
            @RequestPart(required = false) String contact_phone_country,
            @RequestPart(required = false) MultipartFile picture,
            @RequestPart(required = false) MultipartFile logo,
            @RequestPart(required = false) MultipartFile attachment
    ) {
        return createListing(
                category, title, description, state, city, venue, event_date, start_time, end_time,
                contact_email, contact_phone, contact_phone_country, picture, logo, attachment
        );
    }

    @PostMapping(value = {"", "/"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CreateListingResponse createListingJson(@org.springframework.web.bind.annotation.RequestBody Map<String, Object> body) {
        return createListing(
                string(body.get("category")),
                string(body.get("title")),
                string(body.get("description")),
                string(body.get("state")),
                string(body.get("city")),
                string(body.get("venue")),
                string(body.get("event_date")),
                string(body.get("start_time")),
                string(body.get("end_time")),
                string(body.get("contact_email")),
                string(body.get("contact_phone")),
                string(body.get("contact_phone_country")),
                null,
                null,
                null
        );
    }

    private CreateListingResponse createListing(
            String category,
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
        AuthUser user = securityUtils.currentUser();
        ListingResponse listing = listingService.createListing(
                user,
                category != null ? category : "events",
                title,
                description,
                state,
                city,
                venue,
                eventDate,
                startTime,
                endTime,
                contactEmail,
                contactPhone,
                contactPhoneCountry,
                picture,
                logo,
                attachment
        );
        return new CreateListingResponse("Listing submitted for admin approval", listing);
    }

    private static String string(Object value) {
        return value != null ? value.toString() : null;
    }
}
