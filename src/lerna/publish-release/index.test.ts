import * as shell from "shelljs";
import publishLernaRelease from ".";

jest.mock("shelljs", () => ({ exec: jest.fn() }));

describe("the publishLernaRelease function", () => {
  let processCwd: () => string;
  const REPO_PATH = "src/__test__/lerna-repo";

  beforeAll(() => {
    processCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue(REPO_PATH);
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  describe("when there are packages that require updating", () => {
    beforeAll(() => {
      publishLernaRelease();
    });

    it("then the function should execute the lerna exec command with the correct list of package names", () => {
      const cmd = "lerna exec --parallel -- publish-lerna-cutoff-pkg --packages @test/button @test/icon @test/link";
      expect(shell.exec).toHaveBeenCalledWith(cmd);
    });
  });
});
