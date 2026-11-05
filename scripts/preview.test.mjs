// @vitest-environment node
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { matchBrowser, parseCli, parseWindowsRegistry, resolveRequest } from './preview.mjs';

const site = resolve('/srv/site');
const design = resolve('/srv/design');
const mounts = [
  ['/design/', design],
  ['/', site],
];

describe('resolveRequest', () => {
  it('maps each prefix to its own folder', () => {
    expect(resolveRequest('/work/', mounts)).toBe(join(site, 'work'));
    expect(resolveRequest('/design/system/pages/shared.css', mounts)).toBe(
      join(design, 'system/pages/shared.css')
    );
    expect(resolveRequest('/design', mounts)).toBe(design);
  });

  it('refuses paths that climb out of a mount', () => {
    expect(resolveRequest('/../package.json', mounts)).toBeNull();
    expect(resolveRequest('/design/../../package.json', mounts)).toBeNull();
    expect(resolveRequest('/design/..\\..\\package.json', mounts)).toBe(
      process.platform === 'win32' ? null : join(design, '..\\..\\package.json')
    );
  });
});

describe('parseCli', () => {
  it('has safe defaults', () => {
    expect(parseCli([], {})).toMatchObject({
      build: true,
      port: 4400,
      host: '127.0.0.1',
      browser: 'default',
      path: '/',
    });
  });

  it('reads flags and env', () => {
    expect(parseCli(['-n', '-p', '5000', '-b', 'firefox', '--path', 'design/'], {})).toMatchObject({
      build: false,
      port: 5000,
      browser: 'firefox',
      path: '/design/',
    });
    expect(parseCli(['--no-build', '--no-open'], { PREVIEW_BROWSER: 'edge' })).toMatchObject({
      build: false,
      browser: 'none',
    });
    expect(parseCli([], { PREVIEW_BROWSER: 'edge', PREVIEW_PORT: '4500' })).toMatchObject({
      browser: 'edge',
      port: 4500,
    });
    expect(parseCli(['--host'], {}).host).toBe('0.0.0.0');
    expect(parseCli(['--path', 'C:/Program Files/Git/design/system/'], {}).path).toBe(
      '/design/system/'
    );
    expect(parseCli(['--host', '-n'], {})).toMatchObject({ host: '0.0.0.0', build: false });
  });

  it('rejects bad ports', () => {
    expect(() => parseCli(['-p', 'abc'], {})).toThrow(/Invalid port/);
    expect(() => parseCli(['-p', '70000'], {})).toThrow(/Invalid port/);
  });
});

describe('matchBrowser', () => {
  const list = [
    { name: 'Firefox Developer Edition' },
    { name: 'Firefox' },
    { name: 'Microsoft Edge' },
  ];
  it('prefers an exact name, then a partial one, case-insensitively', () => {
    expect(matchBrowser(list, 'firefox').name).toBe('Firefox');
    expect(matchBrowser(list, 'EDGE').name).toBe('Microsoft Edge');
    expect(matchBrowser(list, 'opera')).toBeUndefined();
    expect(matchBrowser(list, '  ')).toBeUndefined();
  });
});

it('parseWindowsRegistry reads names and executables', () => {
  const out = [
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Clients\\StartMenuInternet\\Firefox-308046B0AF4A39CB',
    '    (Default)    REG_SZ    Firefox',
    '',
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Clients\\StartMenuInternet\\Firefox-308046B0AF4A39CB\\shell\\open\\command',
    '    (Default)    REG_SZ    "C:\\Program Files\\Mozilla Firefox\\firefox.exe"',
    '',
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Clients\\StartMenuInternet\\IEXPLORE.EXE\\shell\\open\\command',
    '    (Default)    REG_EXPAND_SZ    %ProgramFiles%\\ie.exe -nohome',
  ].join('\r\n');
  expect(parseWindowsRegistry(out)).toEqual([
    { name: 'Firefox', exe: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe' },
    { name: 'IEXPLORE.EXE', exe: '%ProgramFiles%\\ie.exe' },
  ]);
});
