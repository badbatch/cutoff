import getTag from ".";

describe("the getTag function", () => {
  it("should get release tag when no pre-release id", () => {
    expect(getTag("1.2.3-unstable.0")).toBe("unstable");
  });

  it("should get release tag when a pre-release id is present", () => {
    expect(getTag("1.2.3-unstable233.0")).toBe("unstable233");
  });
});
