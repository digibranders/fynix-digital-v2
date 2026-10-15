import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT_PATH, localBusinessOrigin, signUpUrl } from "./free-business-website";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the sign-up buttons on /free-business-website", () => {
  it("go to the contact page while the dashboard is not switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "");
    expect(localBusinessOrigin()).toBeNull();
    expect(signUpUrl("care")).toBe(CONTACT_PATH);
  });

  it("treat a blank setting as not switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "   ");
    expect(signUpUrl("care")).toBe("/contact");
  });

  it("go to the dashboard's create-account page with the plan, once it is switched on", () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_BUSINESS_URL", "https://app.fynix.digital/");
    expect(localBusinessOrigin()).toBe("https://app.fynix.digital");
    expect(signUpUrl("care")).toBe("https://app.fynix.digital/login?plan=care");
  });
});
