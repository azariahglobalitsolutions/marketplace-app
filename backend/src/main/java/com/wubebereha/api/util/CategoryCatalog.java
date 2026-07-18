package com.wubebereha.api.util;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class CategoryCatalog {

    public static final Map<String, String> CATEGORIES = Map.of(
            "events", "Habesha Event & Activities",
            "restaurants", "Restaurants and Lounge",
            "health", "Health and Wellness",
            "education", "Education and Training",
            "communities", "Communities and Networking"
    );

    public static final List<String> US_STATES = List.of(
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
            "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
            "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
            "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
            "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
            "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
            "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
            "Wisconsin", "Wyoming"
    );

    private CategoryCatalog() {
    }

    public static boolean isValidCategory(String category) {
        return CATEGORIES.containsKey(category);
    }

    public static boolean isValidState(String state) {
        return US_STATES.contains(state);
    }

    public static List<Map<String, String>> categoryList() {
        return CATEGORIES.entrySet().stream()
                .map(entry -> Map.of("id", entry.getKey(), "label", entry.getValue()))
                .toList();
    }
}
