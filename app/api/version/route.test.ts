import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/version", () => {
  it("returns json with commitSha and status ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("commitSha");
    expect(data.status).toBe("ok");
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
});
