const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDirectory = path.resolve(__dirname, '..');
const packageJson = require(path.join(rootDirectory, 'package.json'));
const pluginDirectoryName = 'find-my-rep-plugin';
const distributionDirectory = path.join(rootDirectory, 'dist');
const archivePath = path.join(
  distributionDirectory,
  `${pluginDirectoryName}-${packageJson.version}.zip`
);
const runtimeEntries = [
  'build',
  'includes',
  'languages',
  'find-my-rep-plugin.php',
  'LICENSE',
  'README.md',
];

for (const entry of runtimeEntries) {
  if (!fs.existsSync(path.join(rootDirectory, entry))) {
    throw new Error(`Required package entry is missing: ${entry}`);
  }
}

fs.mkdirSync(distributionDirectory, { recursive: true });
fs.rmSync(archivePath, { force: true });

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'find-my-rep-package-'));
const stagedPluginDirectory = path.join(temporaryDirectory, pluginDirectoryName);

try {
  fs.mkdirSync(stagedPluginDirectory);

  for (const entry of runtimeEntries) {
    fs.cpSync(
      path.join(rootDirectory, entry),
      path.join(stagedPluginDirectory, entry),
      { recursive: true }
    );
  }

  const zipResult = spawnSync('zip', ['-rq', archivePath, pluginDirectoryName], {
    cwd: temporaryDirectory,
    stdio: 'inherit',
  });

  if (zipResult.error) {
    throw zipResult.error;
  }

  if (zipResult.status !== 0) {
    throw new Error(`zip exited with status ${zipResult.status}`);
  }
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Created ${path.relative(rootDirectory, archivePath)}`);