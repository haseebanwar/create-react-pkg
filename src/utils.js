import { execSync } from 'child_process';

export function getAuthorName() {
  let author = '';

  author = execSync('npm config get init-author-name').toString().trim();
  if (author) return author;

  author = execSync('git config --global user.name').toString().trim();
  if (author) return author;

  return author;
}

export function getPackageCMD(useNpm) {
  if (useNpm) return 'npm';

  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch (error) {
    // yarn is not installed, use npm as fallback
    return 'npm';
  }
}
