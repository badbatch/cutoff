import shell from "shelljs";
import yargs from "yargs";
import publishLernaRelease from ".";

jest.mock("shelljs", () => ({ exec: jest.fn() }));

jest.mock("yargs", () => ({
  array: jest.fn().mockReturnThis(),
  parse: jest.fn(),
}));

describe("the publishLernaPackage function", () => {
  let processCwd: () => string;
  const REPO_PATH = "src/__tests__/lerna-repo/packages/button";

  beforeAll(() => {
    processCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue(REPO_PATH);
    process.env.LERNA_PACKAGE_NAME = "@test/button";
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  describe("when the package is not in the list that requires updating", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ packages: ["@test/icon", "@test/link"] });
      publishLernaRelease();
    });

    it("then the function should not execute the yarn publish command", () => {
      expect(shell.exec).not.toHaveBeenCalled();
    });
  });

  describe("when the package is in the list that requires updating", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ packages: ["@test/button", "@test/icon", "@test/link"] });
      publishLernaRelease();
    });

    it("then the function should execute the yarn publish command with the correct version number", () => {
      expect(shell.exec).toHaveBeenCalledWith("yarn publish --new-version 0.0.1");
    });
  });
});
