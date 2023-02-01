import shelljs from 'shelljs';

export const addCommitPushRelease = (version: string) => {
  shelljs.exec('git add --all');
  shelljs.exec(`git commit --no-verify -m "Release version ${version}."`);
  shelljs.exec('git push --no-verify');
  shelljs.exec(`git tag -a v${version} -m "Release version ${version}."`);
  shelljs.exec(`git push origin v${version} --no-verify`);
};
