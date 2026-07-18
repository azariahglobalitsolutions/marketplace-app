/** Mirrors backend DTOs — see docs/API_CONTRACT.md */

export type UserRole = "user" | "admin";

export type ListingCategory =
  | "events"
  | "restaurants"
  | "health"
  | "education"
  | "communities";

export type ListingStatus = "pending" | "approved" | "rejected";

export type PricingTierId = "starter" | "growth" | "premium";

export interface ErrorResponse {
  error: string;
}

export interface AuthRequest {
  email?: string;
  phone?: string;
  phone_country?: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email?: string | null;
  phone?: string | null;
  phone_country?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface MeResponse {
  user: UserResponse;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ListingResponse {
  id: number;
  category: ListingCategory;
  title: string;
  description: string;
  state: string;
  city: string;
  venue?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  contact_phone_country?: string;
  status: ListingStatus;
  created_at?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_phone_tel?: string | null;
}

export interface ListingsResponse {
  listings: ListingResponse[];
  grouped: Record<string, ListingResponse[]>;
  category: string;
  state?: string | null;
}

export interface ListingDetailResponse {
  listing: ListingResponse;
}

export interface CreateListingResponse {
  message: string;
  listing: ListingResponse;
}

export interface CategoryOption {
  id: ListingCategory;
  label: string;
}

export interface CategoriesResponse {
  categories: CategoryOption[];
}

export interface StatesResponse {
  states: string[];
}

export interface EventsResponse {
  events: ListingResponse[];
  grouped: Record<string, ListingResponse[]>;
  state?: string | null;
}

export interface CreateEventResponse {
  message: string;
  event: ListingResponse;
}

export interface CreateListingRequest {
  category?: ListingCategory;
  title: string;
  description: string;
  state: string;
  city: string;
  venue?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_phone_country?: string;
}

export type CreateEventRequest = Omit<CreateListingRequest, "category">;

export interface CreateListingMultipartInput extends CreateListingRequest {
  picture?: Blob | File | null;
  logo?: Blob | File | null;
  attachment?: Blob | File | null;
}

export interface AdvertiseInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  tier: PricingTierId;
  message?: string;
}

export interface AdvertiseInquiryResponse {
  message: string;
  inquiryId: number;
}

export interface PricingTier {
  id: PricingTierId;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
}

export interface TiersResponse {
  tiers: PricingTier[];
}

export interface AdminPendingListing {
  id: number;
  category: ListingCategory;
  category_label: string;
  title: string;
  description: string;
  state: string;
  city: string;
  venue?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: ListingStatus;
  created_at?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_phone_country?: string | null;
  contact_phone_display?: string | null;
  organizer_email?: string | null;
  organizer_phone?: string | null;
  organizer_phone_country?: string | null;
  organizer_phone_display?: string | null;
}

export interface AdminPendingResponse {
  listings: AdminPendingListing[];
  events: AdminPendingListing[];
}

/** JPA entity shape returned by approve/reject (may include nested organizer). */
export interface AdminListingEntity {
  id: number;
  category: ListingCategory;
  title: string;
  description: string;
  state: string;
  city: string;
  venue?: string | null;
  eventDate?: string | null;
  event_date?: string | null;
  startTime?: string | null;
  start_time?: string | null;
  endTime?: string | null;
  end_time?: string | null;
  status: ListingStatus;
  createdAt?: string | null;
  created_at?: string | null;
  contactEmail?: string | null;
  contact_email?: string | null;
  contactPhone?: string | null;
  contact_phone?: string | null;
  organizer?: Record<string, unknown>;
}

export interface AdminActionResponse {
  message: string;
  listing: AdminListingEntity;
  event: AdminListingEntity;
}

export interface AdInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  tier: string;
  message?: string | null;
  createdAt?: string | null;
}

export interface AdInquiriesResponse {
  inquiries: AdInquiry[];
}

export interface MyListingsResponse {
  listings: ListingResponse[];
}
