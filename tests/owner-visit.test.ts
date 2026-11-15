import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  OWNER_STORAGE_KEY,
  applyOwnerLink,
  findOwnerLink,
  isExcluded,
  withoutParam,
} from "@/lib/owner-visit";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe("owner visit links", () => {
  it("stores hashes, never a raw link value", () => {
    const source = readFileSync("src/lib/owner-visit.ts", "utf8");
    const hashes = source.match(/"[0-9a-f]{64}"/g) ?? [];
    expect(hashes).toHaveLength(2);
  });

  it("ignores values that are not the links", async () => {
    const fake = randomBytes(32).toString("base64url");
    expect(createHash("sha256").update(fake).digest("hex")).toHaveLength(64);
    expect(await findOwnerLink(`?x=${fake}`)).toBeNull();
    expect(await findOwnerLink("?me=1")).toBeNull();
  });

  it("on sets the mark, off clears it, and the mark alone excludes", () => {
    const s = memoryStorage();
    applyOwnerLink({ action: "on", param: "x" }, s);
    expect(s.getItem(OWNER_STORAGE_KEY)).toBe("1");
    expect(isExcluded("https://convoke.space/ko", s)).toBe(true);
    applyOwnerLink({ action: "off", param: "x" }, s);
    expect(isExcluded("https://convoke.space/ko", s)).toBe(false);
  });

  it("drops a view whose URL may still carry a link value", () => {
    const v = randomBytes(32).toString("base64url");
    expect(isExcluded(`https://convoke.space/ko?q=${v}`, memoryStorage())).toBe(true);
    expect(isExcluded("https://convoke.space/ko?utm_source=x", memoryStorage())).toBe(false);
  });

  it("strips only the link's parameter", () => {
    expect(withoutParam("?k=v", "k")).toBe("");
    expect(withoutParam("?a=1&k=v&b=2", "k")).toBe("?a=1&b=2");
  });
});
