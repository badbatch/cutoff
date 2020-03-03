import shell from "shelljs";
import publishRelease from ".";

jest.mock("shelljs", () => ({ exec: jest.fn() }));

describe("the publishRelease function", () => {
  let processCwd: () => string;
  const REPO_PATH = "src/__tests__/repo";

  beforeAll(() => {
    processCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue(REPO_PATH);
    publishRelease();
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  it("should execute the yarn publish command with the correct version", () => {
    expect(shell.exec).toHaveBeenCalledWith("yarn publish --new-version 0.0.1");
  });
});
