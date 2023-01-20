import shelljs from 'shelljs';

const { exec } = shelljs;

export const addCommitPushRelease = (version: string) => {
  exec('git add --all');
  exec(`git commit --no-verify -m "Release version ${version}."`);
  exec('git push --no-verify');
  exec(`git tag -a v${version} -m "Release version ${version}."`);
  exec(`git push origin v${version} --no-verify`);
};
