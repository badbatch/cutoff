import { writeFileSync } from "fs";
import forceUpdate from ".";

jest.mock("fs", () => {
  const fs = require.requireActual("fs");
  return { ...fs, writeFileSync: jest.fn() };
});

const updated = [
  { name: "@test/button", private: false, version: "0.0.1" },
  { name: "@test/foundation", private: false, version: "0.0.1" },
  { name: "@test/icon", private: false, version: "0.0.1" },
  { name: "@test/link", private: false, version: "0.0.1" },
  { name: "@test/tabs", private: false, version: "0.0.1" },
  { name: "@test/theme", private: false, version: "0.0.1" },
  { name: "@test/typography", private: false, version: "0.0.1" },
];

describe("the forceUpdate function", () => {
  let processCwd: () => string;
  const REPO_PATH = "src/__test__/lerna-repo";

  beforeAll(() => {
    processCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue(REPO_PATH);
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  describe("when all packages are updated", () => {
    beforeAll(() => {
      forceUpdate("test", "0.0.2");
    });

    it("then the function should call writeFileSync for the button package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const buttonPath = calls[0][0];
      expect(buttonPath.endsWith(`${REPO_PATH}/packages/button/package.json`)).toBe(true);
      const buttonConfig = JSON.parse(calls[0][1]);
      expect(buttonConfig.version).toBe("0.0.2");
      expect(buttonConfig.dependencies["@test/foundation"]).toBe("~0.0.2");
      expect(buttonConfig.devDependencies["@test/icon"]).toBe("~0.0.2");
      expect(buttonConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync for the foundation package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const foundationPath = calls[1][0];
      expect(foundationPath.endsWith(`${REPO_PATH}/packages/foundation/package.json`)).toBe(true);
      const foundationConfig = JSON.parse(calls[1][1]);
      expect(foundationConfig.version).toBe("0.0.2");
      expect(foundationConfig.devDependencies["@test/icon"]).toBe("~0.0.2");
      expect(foundationConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync for the icon package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const iconPath = calls[2][0];
      expect(iconPath.endsWith(`${REPO_PATH}/packages/icon/package.json`)).toBe(true);
      const iconConfig = JSON.parse(calls[2][1]);
      expect(iconConfig.version).toBe("0.0.2");
      expect(iconConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync for the link package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const linkPath = calls[3][0];
      expect(linkPath.endsWith(`${REPO_PATH}/packages/link/package.json`)).toBe(true);
      const linkConfig = JSON.parse(calls[3][1]);
      expect(linkConfig.version).toBe("0.0.2");
      expect(linkConfig.dependencies["@test/foundation"]).toBe("~0.0.2");
      expect(linkConfig.devDependencies["@test/icon"]).toBe("~0.0.2");
      expect(linkConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
      expect(linkConfig.devDependencies["@test/typography"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync for the tabs package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const tabsPath = calls[4][0];
      expect(tabsPath.endsWith(`${REPO_PATH}/packages/tabs/package.json`)).toBe(true);
      const tabsConfig = JSON.parse(calls[4][1]);
      expect(tabsConfig.version).toBe("0.0.2");
      expect(tabsConfig.dependencies["@test/foundation"]).toBe("~0.0.2");
      expect(tabsConfig.devDependencies["@test/link"]).toBe("~0.0.2");
      expect(tabsConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
      expect(tabsConfig.devDependencies["@test/typography"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync for the theme package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const themePath = calls[5][0];
      expect(themePath.endsWith(`${REPO_PATH}/packages/theme/package.json`)).toBe(true);
      const themeConfig = JSON.parse(calls[5][1]);
      expect(themeConfig.version).toBe("0.0.2");
    });

    it("then the function should call writeFileSync for the typography package with the correct config", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const typographyPath = calls[6][0];
      expect(typographyPath.endsWith(`${REPO_PATH}/packages/typography/package.json`)).toBe(true);
      const typographyConfig = JSON.parse(calls[6][1]);
      expect(typographyConfig.version).toBe("0.0.2");
      expect(typographyConfig.dependencies["@test/foundation"]).toBe("~0.0.2");
      expect(typographyConfig.devDependencies["@test/theme"]).toBe("~0.0.2");
    });

    it("then the function should call writeFileSync with the list of updated packages", () => {
      const calls = (writeFileSync as jest.Mock).mock.calls;
      const lernaUpdatedPath = calls[7][0];
      expect(lernaUpdatedPath.endsWith(`${REPO_PATH}/.lerna.updated.json`)).toBe(true);
      const lernaUpdatedPathConfig = JSON.parse(calls[7][1]);
      expect(lernaUpdatedPathConfig).toEqual(updated);
    });
  });
});
