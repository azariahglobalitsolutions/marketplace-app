import {
  createDirectoryMetadata,
  createDirectoryPage,
} from "@/lib/directory/create-directory-route";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";

const section = DIRECTORY_SECTIONS.education;

export const generateMetadata = createDirectoryMetadata(section);
export const revalidate = 60;
export default createDirectoryPage(section);
