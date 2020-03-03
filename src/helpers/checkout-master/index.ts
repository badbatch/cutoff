import shell from "shelljs";

export default function checkoutMaster() {
  shell.exec("git checkout master");
  shell.exec("git fetch origin");
  shell.exec("git merge origin/master");
}
