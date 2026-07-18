package com.wubebereha.api.util;

import java.util.Map;
import java.util.regex.Pattern;

public final class PhoneUtils {

    private static final Pattern NON_DIGITS = Pattern.compile("\\D");

    private static final Map<String, String> COUNTRY_DIAL_CODES = Map.of(
            "US", "1",
            "CA", "1",
            "ET", "251",
            "ER", "291",
            "GB", "44",
            "DE", "49",
            "SE", "46",
            "AE", "971",
            "SA", "966"
    );

    private PhoneUtils() {
    }

    public static String normalizePhone(String phone, String country) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        String countryCode = (country == null || country.isBlank()) ? "US" : country.toUpperCase();
        String dial = COUNTRY_DIAL_CODES.getOrDefault(countryCode, "");
        String digits = NON_DIGITS.matcher(phone.trim()).replaceAll("");

        if (digits.isEmpty()) {
            return null;
        }

        if (phone.trim().startsWith("+")) {
            return "+" + digits;
        }

        if ("US".equals(countryCode) || "CA".equals(countryCode)) {
            if (digits.length() == 11 && digits.startsWith("1")) {
                return "+" + digits;
            }
            if (digits.length() == 10) {
                return "+1" + digits;
            }
        }

        if (!dial.isEmpty() && digits.startsWith(dial)) {
            return "+" + digits;
        }

        if (!dial.isEmpty()) {
            return "+" + dial + digits;
        }

        return "+" + digits;
    }

    public static String formatPhoneDisplay(String phone, String country) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        String countryCode = (country == null || country.isBlank()) ? "US" : country.toUpperCase();
        String digits = NON_DIGITS.matcher(phone).replaceAll("");

        if ("US".equals(countryCode) || "CA".equals(countryCode)) {
            String national;
            if (digits.length() == 11 && digits.startsWith("1")) {
                national = digits.substring(1);
            } else if (digits.length() == 10) {
                national = digits;
            } else {
                return phone.startsWith("+") ? phone : "+" + digits;
            }

            if (national.length() == 10) {
                return "+1 " + national.substring(0, 3) + "-" + national.substring(3, 6) + "-" + national.substring(6);
            }
            return "+1 " + national;
        }

        String dial = COUNTRY_DIAL_CODES.get(countryCode);
        if (dial != null && digits.startsWith(dial)) {
            return "+" + dial + " " + digits.substring(dial.length());
        }

        return phone.startsWith("+") ? phone : "+" + digits;
    }

    public static String phoneToTelLink(String phone, String country) {
        String normalized = normalizePhone(phone, country);
        return normalized != null ? normalized : phone;
    }
}
