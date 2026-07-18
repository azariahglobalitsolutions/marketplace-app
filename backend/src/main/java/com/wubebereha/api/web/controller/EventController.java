package com.wubebereha.api.web.controller;

import com.wubebereha.api.security.AuthUser;
import com.wubebereha.api.security.SecurityUtils;
import com.wubebereha.api.service.ListingService;
import com.wubebereha.api.util.CategoryCatalog;
import com.wubebereha.api.web.dto.Dto.CreateEventResponse;
import com.wubebereha.api.web.dto.Dto.EventsResponse;
import com.wubebereha.api.web.dto.Dto.ListingResponse;
import com.wubebereha.api.web.dto.Dto.StatesResponse;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final ListingService listingService;
    private final SecurityUtils securityUtils;

    public EventController(ListingService listingService, SecurityUtils securityUtils) {
        this.listingService = listingService;
        this.securityUtils = securityUtils;
    }

    @GetMapping(value = {"", "/"})
    public EventsResponse listEvents(@RequestParam(required = false) String state) {
        var response = listingService.listListings("events", state);
        return new EventsResponse(response.listings(), response.grouped(), response.state());
    }

    @GetMapping("/states")
    public StatesResponse states() {
        return new StatesResponse(CategoryCatalog.US_STATES);
    }

    @PostMapping(value = {"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public CreateEventResponse createEvent(@RequestBody Map<String, Object> body) {
        AuthUser user = securityUtils.currentUser();
        ListingResponse listing = listingService.createListing(
                user,
                "events",
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
        return new CreateEventResponse("Event submitted for admin approval", listing);
    }

    private static String string(Object value) {
        return value != null ? value.toString() : null;
    }
}
