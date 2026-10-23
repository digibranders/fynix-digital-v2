import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthorized, parseRevalidateBody } from "@/lib/cms/revalidate";
import { tagsToRevalidate } from "@/lib/cms/tags";

/**
 * Called by the CMS after a post is published, edited, moved or unpublished. Bearer REVALIDATE_SECRET.
 * Body (optional): { "paths": ["/blog/my-post"] }, the changed post addresses (send both the old and new address
 * when one moved). Without paths, every CMS page is revalidated.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request.headers.get("authorization"), process.env.REVALIDATE_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const body = parseRevalidateBody(await request.text());
  if (!body.ok) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const tags = tagsToRevalidate(body.paths);
  // expire: 0 so an editor sees the change on the next request instead of one stale view later.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  // A path that was a 404 or a redirect is not covered by a data tag, so clear its rendered page as well.
  for (const path of body.paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, tags: tags.length, paths: body.paths }, { headers: { "Cache-Control": "no-store" } });
}
