import { cache } from "react";

import { getEventDetailData as fetchEventDetailData } from "@/lib/events/get-event-detail-data";

export const getEventDetailData = cache(fetchEventDetailData);
