import * as shell from "shelljs";
import checkoutMaster from ".";

jest.mock("shelljs", () => ({ exec: jest.fn() }));

describe("the checkoutMaster function", () => {
  beforeAll(() => {
    checkoutMaster();
  });

  it("should execute the git fetch command", () => {
    expect(shell.exec).toHaveBeenCalledWith("git fetch origin");
  });

  it("should execute the git merge command", () => {
    expect(shell.exec).toHaveBeenCalledWith("git merge origin/master");
  });
});
