import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The brand icon as a data URI, for ImageResponse (share images) which can't load relative URLs. */
export async function brandIconDataUri(): Promise<string> {
  const file = await readFile(join(process.cwd(), "public/brand/va-icon.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
}
