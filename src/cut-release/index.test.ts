import shell from "shelljs";
import yargs from "yargs";
import cutRelease from ".";
import addCommitPush from "../helpers/add-commit-push";
import checkoutMaster from "../helpers/checkout-master";
import getNewVersion from "../helpers/get-new-version";

jest.mock("yargs", () => ({
  boolean: jest.fn().mockReturnThis(),
  parse: jest.fn(),
}));

jest.mock("shelljs", () => ({
  echo: jest.fn(),
  exec: jest.fn(),
  exit: jest.fn(),
}));

jest.mock("../helpers/add-commit-push", () => jest.fn());
jest.mock("../helpers/checkout-master", () => jest.fn());
jest.mock("../helpers/get-new-version", () => jest.fn());

describe("the cutRelease function", () => {
  let processCwd: () => string;
  const REPO_PATH = "src/__test__/repo";

  beforeAll(() => {
    processCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue(REPO_PATH);
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  describe("when an invalid type is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ type: "invalid" });
      cutRelease();
    });

    it("then the function should echo the correct message", () => {
      const message = "cutoff expected type to be a valid release type.";
      expect(shell.echo).toBeCalledWith(message);
    });

    it("then the function should exit with the correct code", () => {
      expect(shell.exit).toBeCalledWith(1);
    });
  });

  describe("when a valid type is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ type: "patch" });
      (getNewVersion as jest.Mock).mockReturnValue("0.0.2");
      cutRelease();
    });

    it("then the function should call getNewVersion with the correct version and type", () => {
      expect(getNewVersion).toHaveBeenCalledWith("0.0.1", "patch", undefined, undefined);
    });

    it("then the function should call checkoutMaster", () => {
      expect(checkoutMaster).toHaveBeenCalled();
    });

    it("then the function should execute the changelog command with the correct type", () => {
      expect(shell.exec).toBeCalledWith("yarn run changelog --patch");
    });

    it("then the function should execute the pre-version script if it exists", () => {
      expect(shell.exec).toBeCalledWith("yarn run cutoff:pre-version");
    });

    it("then the function should execute the yarn version command", () => {
      expect(shell.exec).toBeCalledWith("yarn version --new-version 0.0.2 --no-git-tag-version");
    });

    it("then the function should execute the post-version script if it exists", () => {
      expect(shell.exec).toBeCalledWith("yarn run cutoff:post-version");
    });

    it("then the function should call addCommitPush with the correct version", () => {
      expect(addCommitPush).toHaveBeenCalledWith("0.0.2");
    });
  });

  describe("when an invalid tag is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ type: "prerelease", tag: "invalid" });
      cutRelease();
    });

    it("then the function should echo the correct message", () => {
      const message = "cutoff expected tag to be a valid release tag.";
      expect(shell.echo).toBeCalledWith(message);
    });

    it("then the function should exit with the correct code", () => {
      expect(shell.exit).toBeCalledWith(1);
    });
  });

  describe("when dryrun is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ dryrun: true, type: "patch" });
      (getNewVersion as jest.Mock).mockReturnValue("0.0.2");
      (addCommitPush as jest.Mock).mockClear();
      cutRelease();
    });

    it("then the function should not call addCommitPush", () => {
      expect(addCommitPush).not.toHaveBeenCalled();
    });
  });

  describe("when skip-checkout is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ skipCheckout: true, type: "patch" });
      (getNewVersion as jest.Mock).mockReturnValue("0.0.2");
      (checkoutMaster as jest.Mock).mockClear();
      cutRelease();
    });

    it("then the function should not call checkoutMaster", () => {
      expect(checkoutMaster).not.toHaveBeenCalled();
    });
  });

  describe("when skip-prehook is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ skipPrehook: true, type: "patch" });
      (getNewVersion as jest.Mock).mockReturnValue("0.0.2");
      (shell.exec as jest.Mock).mockClear();
      cutRelease();
    });

    it("then cutoff:pre-version should not be executed", () => {
      const hook = "yarn run cutoff:pre-version";
      expect(shell.exec).not.toBeCalledWith(hook);
    });
  });

  describe("when skip-prehook is passed into the function", () => {
    beforeAll(() => {
      (yargs.parse as jest.Mock).mockReturnValue({ skipPosthook: true, type: "patch" });
      (getNewVersion as jest.Mock).mockReturnValue("0.0.2");
      (shell.exec as jest.Mock).mockClear();
      cutRelease();
    });

    it("then cutoff:post-version should not be executed", () => {
      const hook = "yarn run cutoff:post-version";
      expect(shell.exec).not.toBeCalledWith(hook);
    });
  });
});
