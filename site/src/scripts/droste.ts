// Infinite zoom into Escher's twist (de Smit and Lenstra, Notices of the AMS, 2003).
// The straight picture f has four paintings nested at 1/4 size each, so f(256z) = f(z).
// Each screen point w shows f(w^alpha), alpha = (2*pi*i + log 256) / (2*pi*i). Zooming in by the
// self-similarity gamma on screen is the same as scaling z by 1/256, so the zoom is a phase that wraps.
import { PERIOD, selfSimilarity } from '../lib/droste';

const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-droste]');
const gl = canvas?.getContext('webgl2', { antialias: false });

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D atlas;
uniform vec2 res;
uniform float phase;   // zoom position, in periods
uniform float twist;   // 1 = Escher's twist, 0 = the straight studies
out vec4 color;
const float PI = 3.14159265358979;
const float L = log(${PERIOD.toFixed(1)});
const float L4 = log(4.0);
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
void main() {
  float unit = 0.5 * min(res.x, res.y);
  vec2 w = (gl_FragCoord.xy - 0.5 * res) / unit;
  float rw = max(length(w), 1e-6);
  vec2 lw = vec2(log(rw), atan(w.y, w.x));
  vec2 a = vec2(1.0, -twist * L / (2.0 * PI));   // alpha = 1 + L/(2*pi*i)
  vec2 lz = cmul(a, lw);
  lz.x -= phase * L;
  lz.x -= L * floor(lz.x / L);                   // |z| in [1, 256): f(256z) = f(z)
  lz.x -= L;                                     // |z| in [1/256, 1)
  vec2 z = exp(lz.x) * vec2(cos(lz.y), sin(lz.y));
  // Pick the study: the square shell (1/4, 1] at the right power of 4.
  float r = max(abs(z.x), abs(z.y));
  float j = floor(-log(r) / L4);
  vec2 zr = z * exp(j * L4);
  float level = mod(j, 4.0);
  vec2 uv = vec2(0.5 + 0.5 * zr.x, 0.5 - 0.5 * zr.y);
  vec2 tile = vec2(mod(level, 2.0), floor(level / 2.0));
  // Level of detail from the map's own derivative, so seams and the branch cut do not blur.
  float px = length(a) * length(zr) / rw / unit * 0.5 * 1024.0;
  color = textureLod(atlas, (tile + uv) * 0.5, log2(max(px, 1.0)));
}`;

function compile(g: WebGL2RenderingContext, type: number, src: string) {
  const s = g.createShader(type)!;
  g.shaderSource(s, src);
  g.compileShader(s);
  if (!g.getShaderParameter(s, g.COMPILE_STATUS))
    throw new Error(g.getShaderInfoLog(s) || 'shader');
  return s;
}

// Four paintings, each cropped to a square tile with a gilt frame at its edge; the next one hangs in its middle.
async function buildAtlas(srcs: string[]) {
  const T = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = 2 * T;
  const x = c.getContext('2d')!;
  const imgs = await Promise.all(
    srcs.map(src => {
      const im = new Image();
      im.src = src;
      return im.decode().then(() => im);
    })
  );
  imgs.forEach((im, i) => {
    const [ox, oy] = [(i % 2) * T, Math.floor(i / 2) * T];
    const s = Math.min(im.naturalWidth, im.naturalHeight);
    x.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, ox, oy, T, T);
    const b = T * 0.035;
    x.strokeStyle = '#b8893a';
    x.lineWidth = b;
    x.strokeRect(ox + b / 2, oy + b / 2, T - b, T - b);
    x.strokeStyle = '#4a3416';
    x.lineWidth = T * 0.006;
    x.strokeRect(ox + b, oy + b, T - 2 * b, T - 2 * b);
  });
  return c;
}

async function start(g: WebGL2RenderingContext, cv: HTMLCanvasElement) {
  const prog = g.createProgram()!;
  g.attachShader(prog, compile(g, g.VERTEX_SHADER, VERT));
  g.attachShader(prog, compile(g, g.FRAGMENT_SHADER, FRAG));
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error('link');
  g.useProgram(prog);
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, 'p');
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);

  const atlas = await buildAtlas((cv.dataset.studies || '').split(' '));
  g.bindTexture(g.TEXTURE_2D, g.createTexture());
  g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, atlas);
  g.generateMipmap(g.TEXTURE_2D);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);

  const u = (n: string) => g.getUniformLocation(prog, n);
  const [uRes, uPhase, uTwist] = [u('res'), u('phase'), u('twist')];

  const out = document.querySelector<HTMLOutputElement>('[data-out]')!;
  const playBtn = document.querySelector<HTMLButtonElement>('[data-play]')!;
  const twistBtn = document.querySelector<HTMLButtonElement>('[data-twist]')!;
  const { scale, turn } = selfSimilarity();
  let phase = 0;
  let twist = true;
  let playing = false;
  let last = 0;
  let queued = false;

  function draw() {
    queued = false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = Math.round(cv.clientWidth * dpr);
    if (cv.width !== size) cv.width = cv.height = size;
    g.viewport(0, 0, size, size);
    g.uniform2f(uRes, size, size);
    g.uniform1f(uPhase, phase - Math.floor(phase));
    g.uniform1f(uTwist, twist ? 1 : 0);
    g.drawArrays(g.TRIANGLES, 0, 3);
    const n = Math.trunc(phase);
    const each = twist
      ? `${scale.toFixed(2)}× smaller, turned ${turn.toFixed(1)}°`
      : `${PERIOD}× smaller`;
    out.value = `${Math.abs(n)} ${Math.abs(n) === 1 ? 'repeat' : 'repeats'} ${n < 0 ? 'out' : 'in'}; each one ${each}`;
  }
  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(draw);
    }
  };
  // Same on-screen speed with or without the twist: one period is 22.58x on screen twisted, 256x straight.
  const zoom = (d: number) => {
    phase += d * (Math.log(scale) / Math.log(twist ? scale : PERIOD));
    request();
  };

  function tick(t: number) {
    if (!playing) return;
    if (last) zoom(((t - last) / 1000) * 0.18);
    last = t;
    requestAnimationFrame(tick);
  }
  function setPlaying(on: boolean) {
    playing = on;
    last = 0;
    playBtn.setAttribute('aria-pressed', String(on));
    playBtn.textContent = on ? 'Pause' : 'Play';
    if (on) requestAnimationFrame(tick);
  }

  document
    .querySelectorAll<HTMLButtonElement>('[data-zoom]')
    .forEach(b => b.addEventListener('click', () => zoom(Number(b.dataset.zoom))));
  playBtn.addEventListener('click', () => setPlaying(!playing));
  twistBtn.addEventListener('click', () => {
    twist = !twist;
    twistBtn.setAttribute('aria-pressed', String(twist));
    request();
  });
  cv.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      zoom(-e.deltaY / 1500);
    },
    { passive: false }
  );
  let dragY: number | null = null;
  cv.addEventListener('pointerdown', e => {
    dragY = e.clientY;
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (dragY === null) return;
    zoom((dragY - e.clientY) / 300);
    dragY = e.clientY;
  });
  cv.addEventListener('pointerup', () => (dragY = null));
  cv.addEventListener('pointercancel', () => (dragY = null));
  cv.addEventListener('keydown', e => {
    if (e.key === '+' || e.key === '=') zoom(0.1);
    else if (e.key === '-' || e.key === '_') zoom(-0.1);
    else if (e.key === 'p' || e.key === 'P') setPlaying(!playing);
    else return;
    e.preventDefault();
  });
  new ResizeObserver(request).observe(cv);

  cv.hidden = false;
  document.querySelector<HTMLElement>('[data-fallback]')!.hidden = true;
  document.querySelector<HTMLElement>('[data-controls]')!.hidden = false;
  draw();
  // Play on its own only when the site's motion setting is on.
  if (document.documentElement.dataset.motion === 'on') setPlaying(true);
}

if (canvas && gl) start(gl, canvas).catch(() => {});
