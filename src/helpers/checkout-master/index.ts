import * as shell from "shelljs";

export function checkoutMaster(): void {
  shell.exec("git checkout master");
  shell.exec("git fetch origin");
  shell.exec("git merge origin/master");
}
