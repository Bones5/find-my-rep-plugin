import { clearSessionStoragePrefix } from "../../src/hooks/useSessionStorage";

describe("clearSessionStoragePrefix", () => {
  test("clears only progress belonging to the reloaded block", () => {
    sessionStorage.setItem("fmr-/page/-0-step", '"select"');
    sessionStorage.setItem("fmr-/page/-0-representatives", "[]");
    sessionStorage.setItem("fmr-/page/-1-step", '"letter"');
    sessionStorage.setItem("unrelated", "value");

    clearSessionStoragePrefix("fmr-/page/-0");

    expect(sessionStorage.getItem("fmr-/page/-0-step")).toBeNull();
    expect(sessionStorage.getItem("fmr-/page/-0-representatives")).toBeNull();
    expect(sessionStorage.getItem("fmr-/page/-1-step")).toBe('"letter"');
    expect(sessionStorage.getItem("unrelated")).toBe("value");
  });
});