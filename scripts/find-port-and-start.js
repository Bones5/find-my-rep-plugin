#!/usr/bin/env node

/**
 * Finds the next available port starting from the preferred port in .wp-env.json,
 * writes a .wp-env.override.json with the available ports, then starts wp-env.
 */

const net = require("net");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const WP_ENV_PATH = path.join(ROOT, ".wp-env.json");
const OVERRIDE_PATH = path.join(ROOT, ".wp-env.override.json");

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(startPort, count = 2) {
  // Find `count` consecutive available ports starting from startPort
  let port = startPort;
  while (port < startPort + 100) {
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => isPortAvailable(port + i)),
    );
    if (results.every(Boolean)) {
      return port;
    }
    port++;
  }
  throw new Error(
    `Could not find ${count} consecutive available ports starting from ${startPort}`,
  );
}

async function main() {
  const wpEnv = JSON.parse(fs.readFileSync(WP_ENV_PATH, "utf8"));
  const preferredPort = wpEnv.port || 8888;
  const preferredTestsPort = wpEnv.testsPort || preferredPort + 1;

  // We need two consecutive ports: one for dev, one for tests
  const basePort = await findAvailablePort(preferredPort);

  const override = {
    port: basePort,
    testsPort: basePort + 1,
  };

  if (basePort !== preferredPort) {
    console.log(
      `\x1b[33mPort ${preferredPort} is in use — using port ${basePort} instead\x1b[0m`,
    );
  }

  fs.writeFileSync(OVERRIDE_PATH, JSON.stringify(override, null, 2) + "\n");
  console.log(`WordPress: http://localhost:${basePort}`);
  console.log(`Tests:     http://localhost:${basePort + 1}`);

  // Start wp-env (inherits stdio so output streams through)
  try {
    execSync("npx wp-env start", {
      cwd: ROOT,
      stdio: "inherit",
    });
  } catch (e) {
    process.exit(e.status || 1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
