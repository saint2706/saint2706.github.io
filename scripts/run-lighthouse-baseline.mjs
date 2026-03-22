import { spawn } from 'node:child_process';
import process from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.LIGHTHOUSE_PORT ?? '4173', 10);
const baseUrl = `http://${host}:${port}`;
const rootDir = fileURLToPath(new globalThis.URL('..', import.meta.url));
const auditsDir = new globalThis.URL('../docs/audits/', import.meta.url);
const outputFiles = ['docs/audits/lighthouse-home.json', 'docs/audits/lighthouse-playground.json'];
const routes = [
  { path: '/', output: outputFiles[0] },
  { path: '/playground', output: outputFiles[1] },
];

async function waitForServer(url, attempts = 60) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await globalThis.fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for preview server at ${url}`);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
    });
  });
}

const preview = spawn(
  'pnpm',
  ['exec', 'vite', 'preview', '--host', host, '--port', String(port), '--strictPort'],
  {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  }
);

let chrome;

try {
  await waitForServer(`${baseUrl}/`);
  await mkdir(auditsDir, { recursive: true });

  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    logLevel: 'error',
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  for (const route of routes) {
    const url = new globalThis.URL(route.path, `${baseUrl}/`).toString();
    const outputPath = new globalThis.URL(`../${route.output}`, import.meta.url);

    const runnerResult = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
      },
      desktopConfig
    );

    const jsonReport = JSON.stringify(JSON.parse(runnerResult.report), null, 2);
    await writeFile(outputPath, `${jsonReport}\n`);
  }

  await runCommand('pnpm', ['exec', 'prettier', '--write', ...outputFiles]);
} finally {
  if (chrome) {
    await chrome.kill();
  }

  preview.kill('SIGTERM');

  await new Promise(resolve => {
    preview.on('exit', () => resolve());
    globalThis.setTimeout(resolve, 5000);
  });
}
