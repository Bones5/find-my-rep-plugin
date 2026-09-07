const fs = require('fs');
const path = require('path');

const rootDirectory = path.resolve(__dirname, '..');
const packagePath = path.join(rootDirectory, 'package.json');
const pluginPath = path.join(rootDirectory, 'find-my-rep-plugin.php');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid semantic version in package.json: ${version}`);
}

let pluginSource = fs.readFileSync(pluginPath, 'utf8');
const headerPattern = /(\* Version:\s*)\S+/;
const constantPattern = /(define\('FIND_MY_REP_VERSION',\s*')[^']+('\);)/;

if (!headerPattern.test(pluginSource) || !constantPattern.test(pluginSource)) {
  throw new Error('Could not find both WordPress plugin version declarations.');
}

pluginSource = pluginSource
  .replace(headerPattern, `$1${version}`)
  .replace(constantPattern, `$1${version}$2`);

fs.writeFileSync(pluginPath, pluginSource);
console.log(`Synced WordPress plugin version ${version}.`);