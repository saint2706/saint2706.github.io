#!/usr/bin/env node
// Builds the new Astro site (site/) and serves it at / with the design concepts at /design/, then opens a browser.
// Run `pnpm preview --help` for options.
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { homedir, networkInterfaces } from 'node:os';
import { delimiter, extname, join, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const siteDist = join(root, 'site', 'dist');
// The design pages link relatively, so any prefix works; the Astro build uses root-absolute URLs and must sit at /.
export const MOUNTS = [
  ['/design/', join(root, 'design')],
  ['/', siteDist],
];

const HELP = `Usage: pnpm preview [options]

Builds site/ and serves it at / with design/ at /design/.

  -n, --no-build        Serve the existing site/dist (builds anyway if it is missing)
  -p, --port <n>        Port to try first (default 4400; the next free port is used if busy)
      --host [addr]     Listen beyond this machine (default 0.0.0.0), e.g. to test on a phone
  -b, --browser <name>  Open in this browser: part of its name ("firefox", "edge", "brave"), "default" or "none"
      --pick            Choose from your installed browsers interactively
      --list-browsers   Print the browsers found on this machine and exit
      --path <path>     Page to open first (e.g. design/system/pages/)
      --no-open         Do not open a browser
  -h, --help            Show this help

Environment: PREVIEW_BROWSER sets the default for --browser, PREVIEW_PORT for --port.`;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
};

export function parseCli(argv, env = process.env) {
  // A bare --host means "all interfaces"; parseArgs has no optional-value options.
  const args = argv.flatMap((a, i) =>
    a === '--host' && (argv[i + 1] ?? '-').startsWith('-') ? [a, '0.0.0.0'] : [a]
  );
  const { values } = parseArgs({
    args,
    allowNegative: true,
    options: {
      build: { type: 'boolean', default: true },
      n: { type: 'boolean', short: 'n' },
      port: { type: 'string', short: 'p' },
      host: { type: 'string' },
      browser: { type: 'string', short: 'b' },
      pick: { type: 'boolean' },
      'list-browsers': { type: 'boolean' },
      path: { type: 'string', default: '/' },
      open: { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h' },
    },
  });
  let path = values.path.replace(/\\/g, '/');
  // Git Bash rewrites "/design/" to "C:/Program Files/Git/design/"; recover the URL part after the Git root.
  const msys = path.match(/^[A-Za-z]:\/.*?\/Git(\/.*)$/i);
  if (msys) path = msys[1];
  const rawPort = values.port ?? env.PREVIEW_PORT ?? '4400';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error(`Invalid port: ${rawPort}`);
  return {
    build: values.build && !values.n,
    port,
    host: values.host ?? '127.0.0.1',
    browser: values.open ? (values.browser ?? env.PREVIEW_BROWSER ?? 'default') : 'none',
    pick: Boolean(values.pick),
    listBrowsers: Boolean(values['list-browsers']),
    path: '/' + path.replace(/^\/+/, ''),
    help: Boolean(values.help),
  };
}

/** Maps a decoded URL path to a file inside one mount, or null when it would escape the mount. */
export function resolveRequest(urlPath, mounts = MOUNTS) {
  const [prefix, base] = mounts.find(([p]) => urlPath.startsWith(p) || urlPath + '/' === p) ?? [];
  if (!base) return null;
  const file = resolve(base, '.' + urlPath.slice(prefix.length - 1));
  return file === base || file.startsWith(base + sep) ? file : null;
}

const escapeHtml = s => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const listing = (dir, urlPath) =>
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(urlPath)}</title>` +
  `<style>body{font:16px/1.6 system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem}</style>` +
  `<h1>${escapeHtml(urlPath)}</h1><ul>` +
  (urlPath === '/' ? '' : '<li><a href="../">../</a></li>') +
  readdirSync(dir, { withFileTypes: true })
    .sort(
      (a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name)
    )
    .map(d => {
      const slash = d.isDirectory() ? '/' : '';
      return `<li><a href="${encodeURIComponent(d.name)}${slash}">${escapeHtml(d.name + slash)}</a></li>`;
    })
    .join('') +
  '</ul>';

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return res.writeHead(405, { allow: 'GET, HEAD' }).end();
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return res.writeHead(400).end('Bad request');
  }
  let file = resolveRequest(urlPath);
  if (!file) return res.writeHead(403).end('Forbidden');
  const send = (status, type, body) => {
    res.writeHead(status, { 'cache-control': 'no-store', 'content-type': type }); // no-store: a rebuild shows on plain reload
    if (req.method === 'HEAD') return res.end();
    if (body.startsWith(root)) return createReadStream(body).pipe(res);
    return res.end(body);
  };
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!urlPath.endsWith('/')) return res.writeHead(301, { location: urlPath + '/' }).end();
    if (!existsSync(join(file, 'index.html')))
      return send(200, TYPES['.html'], listing(file, urlPath));
    file = join(file, 'index.html');
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    const notFound = join(siteDist, '404.html');
    return send(404, TYPES['.html'], existsSync(notFound) ? notFound : 'Not found');
  }
  return send(200, TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', file);
}

// ---- browsers -------------------------------------------------------------

const MAC_APPS = [
  'Safari',
  'Google Chrome',
  'Google Chrome Canary',
  'Firefox',
  'Firefox Developer Edition',
  'Microsoft Edge',
  'Brave Browser',
  'Arc',
  'Vivaldi',
  'Opera',
  'Chromium',
  'Zen',
  'Orion',
  'LibreWolf',
];
const LINUX_BINS = [
  'firefox',
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'microsoft-edge',
  'microsoft-edge-stable',
  'brave-browser',
  'vivaldi-stable',
  'opera',
  'librewolf',
  'zen-browser',
  'epiphany',
];

/** Parses `reg query ...\StartMenuInternet /s /ve` output into { name, exe } entries. */
export function parseWindowsRegistry(out) {
  const names = new Map();
  const exes = new Map();
  let key = '';
  for (const line of out.split(/\r?\n/)) {
    if (/^HKEY_/.test(line)) key = line.trim();
    const value = line.match(/^\s+\(Default\)\s+REG_(?:EXPAND_)?SZ\s+(.+)$/)?.[1]?.trim();
    const m = key.match(/StartMenuInternet\\([^\\]+)(\\shell\\open\\command)?$/i);
    if (!value || !m) continue;
    if (m[2]) exes.set(m[1], value.match(/^"([^"]+)"/)?.[1] ?? value.split(/\s+/)[0]);
    else names.set(m[1], value);
  }
  return [...exes].map(([id, exe]) => ({ name: names.get(id) || id, exe }));
}

export function detectBrowsers(platform = process.platform) {
  const found = [];
  if (platform === 'win32') {
    for (const hive of ['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE', 'HKLM\\SOFTWARE\\WOW6432Node']) {
      let out;
      try {
        out = execFileSync('reg', ['query', `${hive}\\Clients\\StartMenuInternet`, '/s', '/ve'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          windowsHide: true,
        });
      } catch {
        continue; // this hive has no browsers registered
      }
      for (const b of parseWindowsRegistry(out)) {
        const exe = b.exe.replace(/%([^%]+)%/g, (_, v) => process.env[v] ?? '');
        if (existsSync(exe)) found.push({ name: b.name, launch: url => [exe, [url]] });
      }
    }
    // Windows 11 ships Edge but does not always register it under StartMenuInternet.
    for (const dir of [
      process.env['ProgramFiles(x86)'],
      process.env.ProgramFiles,
      process.env.LOCALAPPDATA,
    ]) {
      const exe = dir && join(dir, 'Microsoft', 'Edge', 'Application', 'msedge.exe');
      if (exe && existsSync(exe)) {
        found.push({ name: 'Microsoft Edge', launch: url => [exe, [url]] });
        break;
      }
    }
  } else if (platform === 'darwin') {
    for (const dir of ['/Applications', join(homedir(), 'Applications')])
      for (const app of MAC_APPS) {
        const path = join(dir, `${app}.app`);
        if (existsSync(path)) found.push({ name: app, launch: url => ['open', ['-a', path, url]] });
      }
  } else {
    const dirs = (process.env.PATH ?? '').split(delimiter).filter(Boolean);
    for (const bin of LINUX_BINS) {
      const path = dirs.map(d => join(d, bin)).find(p => existsSync(p));
      if (path) found.push({ name: bin, launch: url => [path, [url]] });
    }
  }
  const seen = new Set();
  return found.filter(b => !seen.has(b.name.toLowerCase()) && seen.add(b.name.toLowerCase()));
}

const defaultBrowser = {
  name: 'system default',
  launch: url =>
    process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url]] // no cmd.exe, so & or ^ in a path cannot be misparsed
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [url]],
};

/** Finds a browser by case-insensitive name; an exact name beats a partial one. */
export function matchBrowser(browsers, query) {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  return (
    browsers.find(b => b.name.toLowerCase() === q) ??
    browsers.find(b => b.name.toLowerCase().includes(q))
  );
}

async function pickBrowser(browsers) {
  if (!process.stdin.isTTY) return defaultBrowser;
  console.log('\n  0) system default');
  browsers.forEach((b, i) => console.log(`  ${i + 1}) ${b.name}`));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('\n  Open in which browser? [0] ')).trim();
  rl.close();
  return browsers[Number(answer) - 1] ?? matchBrowser(browsers, answer) ?? defaultBrowser;
}

async function chooseBrowser(opts) {
  if (opts.browser === 'none') return null;
  if (opts.browser === 'default' && !opts.pick) return defaultBrowser;
  const browsers = detectBrowsers();
  if (opts.pick) return pickBrowser(browsers);
  const match = matchBrowser(browsers, opts.browser);
  if (match) return match;
  const names = browsers.map(b => b.name).join(', ') || 'none';
  console.warn(
    `  No installed browser matches "${opts.browser}" (found: ${names}). Using the system default.`
  );
  return defaultBrowser;
}

function openIn(browser, url) {
  const [cmd, args] = browser.launch(url);
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true });
  child.on('error', () => console.warn(`  Could not start ${browser.name}; open ${url} yourself.`));
  child.unref();
}

// ---- build + serve --------------------------------------------------------

function buildSite() {
  console.log('  Building site/ …\n');
  // Under `pnpm preview`, npm_execpath is pnpm's JS entry; running it through node needs no shell on Windows.
  const pnpmJs = process.env.npm_execpath;
  const viaNode = /\.c?js$/.test(pnpmJs ?? '');
  const { status, error } = spawnSync(
    viaNode ? process.execPath : 'pnpm',
    [...(viaNode ? [pnpmJs] : []), '-F', 'site', 'build'],
    { cwd: root, stdio: 'inherit', shell: !viaNode && process.platform === 'win32' }
  );
  if (error || status !== 0) {
    const why = error ? `: ${error.message}` : ` (exit ${status})`;
    console.error(
      `\n  Site build failed${why}. Fix the error above, or serve the last build with --no-build.`
    );
    process.exit(status || 1);
  }
}

function listen(server, port, host, attemptsLeft = 20) {
  return new Promise((ok, fail) => {
    server.once('error', err => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.log(`  Port ${port} is busy, trying ${port + 1}…`);
        ok(listen(server, port + 1, host, attemptsLeft - 1));
      } else fail(err);
    });
    server.listen(port, host, () => ok(port));
  });
}

const lanAddresses = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => i.address);

async function main() {
  let opts;
  try {
    opts = parseCli(process.argv.slice(2));
  } catch (err) {
    console.error(`  ${err.message}\n\n${HELP}`);
    process.exit(1);
  }
  if (opts.help) return console.log(HELP);
  if (opts.listBrowsers) {
    const list = detectBrowsers();
    console.log(
      list.length
        ? list.map(b => `  ${b.name}`).join('\n')
        : '  None found; the system default is used.'
    );
    return;
  }

  if (opts.build) buildSite();
  else if (!existsSync(join(siteDist, 'index.html'))) {
    console.log('  site/dist is missing, so building once.');
    buildSite();
  }

  const browser = await chooseBrowser(opts);
  const server = createServer(handle);
  let port;
  try {
    port = await listen(server, opts.port, opts.host);
  } catch (err) {
    console.error(`  Could not start the server: ${err.message}`);
    process.exit(1);
  }
  const shown = ['0.0.0.0', '::'].includes(opts.host) ? '127.0.0.1' : opts.host;
  const base = `http://${shown.includes(':') ? `[${shown}]` : shown}:${port}`;
  const lines = [
    `  New site:        ${base}/`,
    `  Design system:   ${base}/design/system/`,
    `  Page designs:    ${base}/design/system/pages/`,
    `  A1 concept:      ${base}/design/concepts/a1-specimen-field/`,
  ];
  if (opts.host !== '127.0.0.1' && opts.host !== 'localhost')
    lines.push(
      '',
      '  On your network (anyone on it can open these):',
      ...lanAddresses().map(a => `    http://${a}:${port}/`)
    );
  console.log(`\n${lines.join('\n')}\n\n  Ctrl+C to stop.\n`);
  if (browser) openIn(browser, base + opts.path);

  const stop = () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
