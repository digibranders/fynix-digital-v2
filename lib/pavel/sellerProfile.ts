/**
 * Seller identity printed on every tax invoice.
 *
 * Values are snapshotted onto each invoice row at issue time, so changing them
 * here only affects invoices issued from that point on. Previously issued
 * invoices keep reproducing exactly as they were issued, which is the point of
 * the snapshot.
 *
 * Everything is overridable by environment variable so a detail can be corrected
 * on the droplet without a code change. The defaults are the registered
 * particulars confirmed from the GST portal on 2026-08-18.
 */

export interface SellerProfile {
  legalName: string;
  tradeName: string;
  gstin: string;
  cin: string;
  address: string;
  stateCode: string;
  supportEmail: string;
  phone: string;
  website: string;
  /** Services Accounting Code printed on the invoice line. */
  sacCode: string;
  /**
   * Whether a Letter of Undertaking is in force. When true, exports are invoiced
   * without IGST and carry the LUT declaration. Set PAVEL_LUT_ACTIVE=false if the
   * LUT lapses, and exports will be taxed at 18% instead.
   */
  lutActive: boolean;
}

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Registered address, one line per element. Kept as an array so the PDF can lay
 * it out without parsing newlines out of a single string.
 */
const DEFAULT_ADDRESS = [
  "Office No. 2617, 26th Floor, Solus Building",
  "Hiranandani Estate, Ghodbunder Road",
  "Thane West, Maharashtra 400607",
  "India",
].join("\n");

export function getSellerProfile(): SellerProfile {
  return {
    legalName: env("PAVEL_SELLER_LEGAL_NAME", "Digibranders Private Limited"),
    tradeName: env("PAVEL_SELLER_TRADE_NAME", "Fynix Digital"),
    gstin: env("PAVEL_SELLER_GSTIN", "27AAICD9268J1Z0"),
    cin: env("PAVEL_SELLER_CIN", "U72900MH2021PTC372344"),
    address: env("PAVEL_SELLER_ADDRESS", DEFAULT_ADDRESS),
    stateCode: env("PAVEL_SELLER_STATE_CODE", "27"),
    supportEmail: env("PAVEL_SELLER_SUPPORT_EMAIL", "hello@fynix.digital"),
    phone: env("PAVEL_SELLER_PHONE", "+91 789 789 6607"),
    website: env("PAVEL_SELLER_WEBSITE", "https://fynix.digital"),
    // 999293: commercial training and coaching services, which is what the
    // workshop supplies. Confirmed 2026-08-18.
    sacCode: env("PAVEL_SELLER_SAC_CODE", "999293"),
    lutActive: env("PAVEL_LUT_ACTIVE", "true").toLowerCase() !== "false",
  };
}

/** Line printed under the seller block, clarifying the brand/entity relationship. */
export function brandDisclosure(profile: SellerProfile): string {
  return `${profile.tradeName} is a brand of ${profile.legalName}.`;
}
