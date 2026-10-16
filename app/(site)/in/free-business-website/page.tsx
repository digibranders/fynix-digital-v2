import type { ReactElement } from "react";
import FreeWebsitePage, { freeWebsiteMetadata } from "@/components/free-business-website/FreeWebsitePage";

export const metadata = freeWebsiteMetadata("in");

export default function FreeBusinessWebsitePage(): ReactElement {
  return <FreeWebsitePage market="in" />;
}
