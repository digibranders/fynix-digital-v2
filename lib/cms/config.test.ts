import { describe, expect, it } from "vitest";
import { readCmsConfig } from "@/lib/cms/config";

describe("readCmsConfig", () => {
  it("is null until both variables are set", () => {
    expect(readCmsConfig({})).toBeNull();
    expect(readCmsConfig({ CMS_API_URL: "https://cms.example.com" })).toBeNull();
    expect(readCmsConfig({ CMS_READ_TOKEN: "t" })).toBeNull();
    expect(readCmsConfig({ CMS_API_URL: "  ", CMS_READ_TOKEN: "t" })).toBeNull();
  });

  it("returns the origin without a trailing slash and the token", () => {
    expect(readCmsConfig({ CMS_API_URL: "https://cms.example.com/", CMS_READ_TOKEN: " tok " })).toEqual({
      baseUrl: "https://cms.example.com",
      token: "tok",
    });
  });

  it("ignores an address that is not an http(s) URL instead of throwing", () => {
    expect(readCmsConfig({ CMS_API_URL: "not a url", CMS_READ_TOKEN: "t" })).toBeNull();
    expect(readCmsConfig({ CMS_API_URL: "ftp://cms.example.com", CMS_READ_TOKEN: "t" })).toBeNull();
  });
});
