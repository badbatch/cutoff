import * as shell from "shelljs";
import addCommitPush from ".";

jest.mock("shelljs", () => ({ exec: jest.fn() }));

describe("the addCommitPush function", () => {
  beforeAll(() => {
    addCommitPush("0.0.1");
  });

  it("should execute the git add command", () => {
    expect(shell.exec).toHaveBeenCalledWith("git add --all");
  });

  it("should execute the git commit command with the correct version", () => {
    expect(shell.exec).toHaveBeenCalledWith("git commit --no-verify -m \"Release version 0.0.1.\"");
  });

  it("should execute the git push command", () => {
    expect(shell.exec).toHaveBeenCalledWith("git push --no-verify");
  });

  it("should execute the git commit command with the correct version", () => {
    expect(shell.exec).toHaveBeenCalledWith("git tag -a v0.0.1 -m \"Release version 0.0.1.\"");
  });

  it("should execute the git push command with the correct version", () => {
    expect(shell.exec).toHaveBeenCalledWith("git push origin v0.0.1 --no-verify");
  });
});
