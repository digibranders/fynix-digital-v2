import type { ReactElement } from "react";
import FreeWebsitePage, { freeWebsiteMetadata } from "@/components/free-business-website/FreeWebsitePage";

export const metadata = freeWebsiteMetadata("us");

export default function UsFreeBusinessWebsitePage(): ReactElement {
  return <FreeWebsitePage market="us" />;
}
