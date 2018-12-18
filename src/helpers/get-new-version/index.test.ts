import shell from "shelljs";
import getNewVersion from ".";

jest.mock("shelljs", () => ({
  echo: jest.fn(),
  exec: jest.fn(),
  exit: jest.fn(),
}));

describe("the getNewVersion function", () => {
  let newVersion: string | undefined;

  describe("when an invalid version is passed into the function", () => {
    beforeAll(() => {
      newVersion = getNewVersion("invalid", "patch");
    });

    it("then the function should echo the correct message", () => {
      expect(shell.echo).toBeCalledWith("The new package verison number is invalid.");
    });

    it("then the function should exit with the correct code", () => {
      expect(shell.exit).toBeCalledWith(1);
    });

    it("then the function should return undefined", () => {
      expect(newVersion).toBeUndefined();
    });
  });

  describe("when a valid version is passed into the function", () => {
    beforeAll(() => {
      newVersion = getNewVersion("0.0.1", "patch");
    });

    it("then the function should return the new version", () => {
      expect(newVersion).toBe("0.0.2");
    });
  });
});
