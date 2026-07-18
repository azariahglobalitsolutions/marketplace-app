package com.wubebereha.api.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public final class Dto {

    private Dto() {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AuthRequest(
            String email,
            String phone,
            @JsonProperty("phone_country") String phoneCountry,
            String password
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record UserResponse(
            Long id,
            String email,
            String phone,
            @JsonProperty("phone_country") String phoneCountry,
            String role
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AuthResponse(String token, UserResponse user) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MeResponse(UserResponse user) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ErrorResponse(String error) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record HealthResponse(String status, String service) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ListingResponse(
            Long id,
            String category,
            String title,
            String description,
            String state,
            String city,
            String venue,
            @JsonProperty("event_date") String eventDate,
            @JsonProperty("start_time") String startTime,
            @JsonProperty("end_time") String endTime,
            @JsonProperty("image_url") String imageUrl,
            @JsonProperty("logo_url") String logoUrl,
            @JsonProperty("attachment_url") String attachmentUrl,
            @JsonProperty("attachment_name") String attachmentName,
            @JsonProperty("contact_phone_country") String contactPhoneCountry,
            String status,
            @JsonProperty("created_at") String createdAt,
            @JsonProperty("contact_email") String contactEmail,
            @JsonProperty("contact_phone") String contactPhone,
            @JsonProperty("contact_phone_tel") String contactPhoneTel
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ListingsResponse(
            List<ListingResponse> listings,
            Map<String, List<ListingResponse>> grouped,
            String category,
            String state
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ListingDetailResponse(ListingResponse listing) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CreateListingResponse(String message, ListingResponse listing) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CategoriesResponse(List<Map<String, String>> categories) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record StatesResponse(List<String> states) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record EventsResponse(
            List<ListingResponse> events,
            Map<String, List<ListingResponse>> grouped,
            String state
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CreateEventResponse(
            String message,
            @JsonProperty("event") ListingResponse event
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AdvertiseInquiryRequest(
            String name,
            String email,
            String phone,
            String tier,
            String message
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record AdvertiseInquiryResponse(
            String message,
            @JsonProperty("inquiryId") Long inquiryId
    ) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TiersResponse(List<Map<String, Object>> tiers) {
    }
}
