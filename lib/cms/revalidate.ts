import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { toSitePath } from "@/lib/cms/paths";

const MAX_PATHS = 50;

/** Constant-time check of an `Authorization: Bearer <secret>` header. Fails closed when no secret is configured. */
export function isAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  const prefix = "Bearer ";
  const presented = header?.startsWith(prefix) ? header.slice(prefix.length) : "";
  // Hash both sides so the comparison is over equal-length buffers whatever the input length.
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b) && header?.startsWith(prefix) === true;
}

const sitePath = z.string().refine((value) => value.startsWith("/") && toSitePath(value.slice(1).split("/")) === value);
const bodySchema = z.object({ paths: z.array(sitePath).max(MAX_PATHS).optional() });

export type RevalidateBody = { ok: true; paths: string[] } | { ok: false };

/** The request body: optional `{ "paths": ["/blog/my-post"] }`. No paths means revalidate every CMS page. */
export function parseRevalidateBody(text: string): RevalidateBody {
  if (text.trim() === "") return { ok: true, paths: [] };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false };
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return { ok: false };
  return { ok: true, paths: [...new Set(parsed.data.paths ?? [])] };
}
