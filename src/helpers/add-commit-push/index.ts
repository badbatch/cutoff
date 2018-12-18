import shell from "shelljs";

export default function addCommitPush(version: string): void {
  shell.exec("git add --all");
  shell.exec(`git commit --no-verify -m "Release version ${version}."`);
  shell.exec("git push --no-verify");
  shell.exec(`git tag -a v${version} -m "Release version ${version}."`);
  shell.exec(`git push origin v${version} --no-verify`);
}
