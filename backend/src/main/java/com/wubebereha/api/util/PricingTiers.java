package com.wubebereha.api.util;

import java.util.List;
import java.util.Map;

public final class PricingTiers {

    public static final List<Map<String, Object>> TIERS = List.of(
            Map.of(
                    "id", "starter",
                    "name", "Starter Spotlight",
                    "price", "$49",
                    "period", "per event",
                    "features", List.of(
                            "Homepage feature for 3 days",
                            "State filter priority",
                            "Social share badge"
                    )
            ),
            Map.of(
                    "id", "growth",
                    "name", "Growth Boost",
                    "price", "$129",
                    "period", "per month",
                    "popular", true,
                    "features", List.of(
                            "Top of daily calendar",
                            "Featured in newsletter",
                            "Banner on advertise page",
                            "Priority support"
                    )
            ),
            Map.of(
                    "id", "premium",
                    "name", "Premium Partner",
                    "price", "$299",
                    "period", "per month",
                    "features", List.of(
                            "Nationwide homepage hero",
                            "Dedicated account manager",
                            "Custom landing page",
                            "Analytics dashboard"
                    )
            )
    );

    private PricingTiers() {
    }

    public static boolean isValidTier(String tierId) {
        return TIERS.stream().anyMatch(tier -> tierId.equals(tier.get("id")));
    }
}
