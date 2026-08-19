import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * A stable, non-reversible handle for the submitting client, used only to rate
 * limit. The raw address is never stored: it is salted and hashed here, so the
 * database holds something that can spot a flood but cannot identify a person.
 */
export async function getRequestIdentity() {
  const headerList = await headers();

  const forwarded = headerList.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";

  const salt = process.env.RATE_LIMIT_SALT ?? "luxeroam-local-salt";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");

  return {
    ipHash,
    userAgent: headerList.get("user-agent") ?? "",
  };
}
