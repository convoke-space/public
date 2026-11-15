import { describe, expect, it } from "vitest";
import {
  OWNER_STORAGE_KEY,
  applyOwnerFlag,
  withoutOwnerParam,
} from "@/lib/owner-visit";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe("owner visit flag", () => {
  it("?me=1 marks the browser and the mark persists without the param", () => {
    const s = memoryStorage();
    expect(applyOwnerFlag("?me=1", s)).toBe(true);
    expect(s.getItem(OWNER_STORAGE_KEY)).toBe("1");
    expect(applyOwnerFlag("", s)).toBe(true);
  });

  it("?me=0 clears the mark", () => {
    const s = memoryStorage();
    applyOwnerFlag("?me=1", s);
    expect(applyOwnerFlag("?me=0", s)).toBe(false);
    expect(applyOwnerFlag("", s)).toBe(false);
  });

  it("an unmarked browser is counted", () => {
    expect(applyOwnerFlag("?q=x", memoryStorage())).toBe(false);
  });

  it("strips only the me param", () => {
    expect(withoutOwnerParam("?me=1")).toBe("");
    expect(withoutOwnerParam("?a=1&me=1&b=2")).toBe("?a=1&b=2");
  });
});
