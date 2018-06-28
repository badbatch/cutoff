import { writeFileSync } from "fs";
import * as shell from "shelljs";
import * as yargs from "yargs";
import { cutLernaRelease } from ".";
import { addCommitPush } from "../../helpers/add-commit-push";
import { checkoutMaster } from "../../helpers/checkout-master";
import { forceUpdate } from "../../lerna/helpers/force-update";
import { updatePackages } from "../helpers/update-packages";

jest.mock("fs", () => ({ writeFileSync: jest.fn() }));

jest.mock("yargs", () => ({
  boolean: jest.fn().mockReturnThis(),
  parse: jest.fn(),
}));

jest.mock("shelljs", () => ({
  echo: jest.fn(),
  exec: jest.fn(),
  exit: jest.fn(),
}));

jest.mock("../../helpers/add-commit-push", () => ({
  addCommitPush: jest.fn(),
}));

jest.mock("../../helpers/checkout-master", () => ({
  checkoutMaster: jest.fn(),
}));

jest.mock("../../lerna/helpers/force-update", () => ({
  forceUpdate: jest.fn(),
}));

jest.mock("../helpers/update-packages", () => ({
  updatePackages: jest.fn(),
}));

describe("the cutLernaRelease function", () => {
  describe("when an invalid type is passed into the function", () => {
    beforeAll(() => {
      yargs.parse.mockReturnValueOnce({ type: "invalid" });
      cutLernaRelease();
    });

    it("then the function should echo the correct message", () => {
      const message = "cutoff expected type to be \"major\", \"minor\" or \"patch\".";
      expect(shell.echo).toBeCalledWith(message);
    });
  });
});
