const { spawnSync } = require('child_process');

const requestedVersion = process.argv[2];
const validIncrement = /^(patch|minor|major)$/;
const validVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

if (!requestedVersion || (!validIncrement.test(requestedVersion) && !validVersion.test(requestedVersion))) {
  console.error('Usage: npm run release -- <patch|minor|major|x.y.z>');
  process.exit(1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpm(args) {
  const result = spawnSync(npmCommand, args, { stdio: 'inherit' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

runNpm(['version', requestedVersion, '--no-git-tag-version']);
runNpm(['run', 'package']);