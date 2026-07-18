import {
  createListingDetailMetadata,
  createListingDetailPage,
} from "@/lib/directory/create-listing-detail-route";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";

const section = DIRECTORY_SECTIONS.communities;

export const generateMetadata = createListingDetailMetadata(section);
export const revalidate = 60;
export default createListingDetailPage(section);
