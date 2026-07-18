import { apiRequest, buildQuery } from "@/lib/api/request";
import type {
  AdminActionResponse,
  AdminPendingResponse,
  AdInquiriesResponse,
  AdvertiseInquiryRequest,
  AdvertiseInquiryResponse,
  AuthRequest,
  AuthResponse,
  CategoriesResponse,
  CreateEventRequest,
  CreateEventResponse,
  CreateListingMultipartInput,
  CreateListingRequest,
  CreateListingResponse,
  EventsResponse,
  HealthResponse,
  ListingCategory,
  ListingDetailResponse,
  ListingsResponse,
  MeResponse,
  MyListingsResponse,
  StatesResponse,
  TiersResponse,
} from "@/types/api";

export type ApiRequestFn = <T>(
  path: string,
  options?: Parameters<typeof apiRequest<T>>[1],
) => Promise<T>;

function appendListingFields(form: FormData, input: CreateListingMultipartInput) {
  const fields: Array<[string, string | undefined]> = [
    ["category", input.category],
    ["title", input.title],
    ["description", input.description],
    ["state", input.state],
    ["city", input.city],
    ["venue", input.venue],
    ["event_date", input.event_date],
    ["start_time", input.start_time],
    ["end_time", input.end_time],
    ["contact_email", input.contact_email],
    ["contact_phone", input.contact_phone],
    ["contact_phone_country", input.contact_phone_country],
  ];

  for (const [key, value] of fields) {
    if (value !== undefined) {
      form.append(key, value);
    }
  }

  if (input.picture) {
    form.append("picture", input.picture);
  }
  if (input.logo) {
    form.append("logo", input.logo);
  }
  if (input.attachment) {
    form.append("attachment", input.attachment);
  }
}

export function createApiEndpoints(request: ApiRequestFn) {
  return {
    getHealth: () => request<HealthResponse>("/health"),

    getMetrics: () =>
      request<string>("/metrics", {
        headers: { Accept: "text/plain" },
      }),

    register: (body: AuthRequest) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body,
      }),

    login: (body: AuthRequest) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body,
      }),

    getMe: () => request<MeResponse>("/api/auth/me"),

    getListings: (params: { category?: ListingCategory; state?: string } = {}) =>
      request<ListingsResponse>(
        `/api/listings${buildQuery({
          category: params.category ?? "events",
          state: params.state,
        })}`,
      ),

    getListingCategories: () =>
      request<CategoriesResponse>("/api/listings/categories"),

    getListingStates: () => request<StatesResponse>("/api/listings/states"),

    getMyListings: () => request<MyListingsResponse>("/api/listings/my"),

    getListing: (listingId: number) =>
      request<ListingDetailResponse>(`/api/listings/${listingId}`),

    createListing: (body: CreateListingRequest) =>
      request<CreateListingResponse>("/api/listings", {
        method: "POST",
        body,
      }),

    createListingMultipart: (input: CreateListingMultipartInput) => {
      const form = new FormData();
      appendListingFields(form, input);
      return request<CreateListingResponse>("/api/listings", {
        method: "POST",
        body: form,
      });
    },

    getEvents: (params: { state?: string } = {}) =>
      request<EventsResponse>(
        `/api/events${buildQuery({
          state: params.state,
        })}`,
      ),

    getEventStates: () => request<StatesResponse>("/api/events/states"),

    createEvent: (body: CreateEventRequest) =>
      request<CreateEventResponse>("/api/events", {
        method: "POST",
        body,
      }),

    getAdvertiseTiers: () => request<TiersResponse>("/api/advertise/tiers"),

    submitAdvertiseInquiry: (body: AdvertiseInquiryRequest) =>
      request<AdvertiseInquiryResponse>("/api/advertise/inquiry", {
        method: "POST",
        body,
      }),

    getAdminPending: () =>
      request<AdminPendingResponse>("/api/admin/pending"),

    approveListing: (listingId: number) =>
      request<AdminActionResponse>(`/api/admin/${listingId}/approve`, {
        method: "POST",
      }),

    rejectListing: (listingId: number) =>
      request<AdminActionResponse>(`/api/admin/${listingId}/reject`, {
        method: "POST",
      }),

    getAdminAdInquiries: () =>
      request<AdInquiriesResponse>("/api/admin/ad-inquiries"),
  };
}

export type ApiEndpoints = ReturnType<typeof createApiEndpoints>;
