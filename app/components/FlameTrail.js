"use client";
// Cursor flame for the black intro screen, drawn in a stylised "cel" look:
// hard-edged bands of colour (cream core → yellow → orange → brand red) with licking tongues
// that rise, tear off and burn out. Biggest at the cursor; the path behind it dies quickly.
import { useEffect, useRef } from "react";

const SCALE = 3;          // heat map is drawn at 1/3 resolution, then sharpened by the shader
const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*.5+.5; uv.y = 1.-uv.y; gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
varying vec2 uv; uniform sampler2D heat; uniform float t; uniform vec2 res;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float band(float e, float h){ return smoothstep(e-.012, e+.012, h); }
void main(){
  vec2 q = uv * res / 90.;                         // noise scale in screen units
  float n1 = n(q*1.1 + vec2(0., t*2.6));           // big licks, scrolling upward
  float n2 = n(q*2.7 + vec2(4.3, t*4.2));          // small ragged detail
  vec2 d = vec2((n1-.5)*.046 + (n2-.5)*.012, (n2-.5)*.014) * vec2(res.y/res.x, 1.);
  float h0 = texture2D(heat, uv + d).r;
  float h = h0 - ((n1-.5)*.20 + (n2-.5)*.08) * smoothstep(0., .12, h0); // tears the edge into tongues and loose flecks
  vec3 red = vec3(.886,0.,.067), ora = vec3(1.,.36,.04), yel = vec3(1.,.72,.12), cre = vec3(1.,.95,.74);
  vec3 col = red;
  col = mix(col, ora, band(.36, h));
  col = mix(col, yel, band(.60, h));
  col = mix(col, cre, band(.90, h));
  float a = band(.17, h);
  float glow = smoothstep(.03, .17, h0) * .25 * (1.-a); // faint warm halo outside the hard edge
  gl_FragColor = vec4(col*a + red*glow, a + glow);
}`;

export default function FlameTrail({ active }) {
  const ref = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current;
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const hc = document.createElement("canvas"), hx = hc.getContext("2d");

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, "t"), uRes = gl.getUniformLocation(prog, "res");
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_2D, k, v);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; gl.viewport(0, 0, cv.width, cv.height);
      hc.width = Math.ceil(innerWidth / SCALE); hc.height = Math.ceil(innerHeight / SCALE);
      gl.uniform2f(uRes, innerWidth, innerHeight);
    };
    resize();

    // soft white blob used to paint heat
    const blob = document.createElement("canvas"); blob.width = blob.height = 64;
    { const x = blob.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64); }

    let parts = [], raf = 0, running = false, last = 0, lx = null, ly = null, mx = 0, my = 0, lastMove = -1e9, t0 = performance.now(), emit = 0;

    // core = the big flame at the cursor; trail = smaller, shorter-lived fire left on the path
    const spawn = (x, y, core) => {
      if (parts.length > 500) return;
      const r = Math.random;
      parts.push(core
        ? { x: x + (r() - .5) * 14, y: y + (r() - .5) * 6, vx: (r() - .5) * 50, vy: -(190 + r() * 260), life: 0, max: .55 + r() * .5, size: 30 + r() * 28, heat: .3, ph: r() * 6.28 }
        : { x: x + (r() - .5) * 8, y: y + (r() - .5) * 8, vx: (r() - .5) * 30, vy: -(70 + r() * 110), life: 0, max: .45 + r() * .4, size: 18 + r() * 16, heat: .34, ph: r() * 6.28 });
      if (core && r() < .06) // sparks
        parts.push({ x, y, vx: (r() - .5) * 180, vy: -(240 + r() * 260), life: 0, max: .5 + r() * .4, size: 4 + r() * 3, heat: 1, ph: r() * 6.28, spark: true });
    };

    const tick = (now) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, .05)); last = now;
      if (activeRef.current && now - lastMove < 220) { emit += dt * 120; while (emit >= 1) { emit--; spawn(mx, my, true); } }
      hx.globalCompositeOperation = "source-over"; hx.globalAlpha = 1; hx.fillStyle = "#000"; hx.fillRect(0, 0, hc.width, hc.height);
      hx.globalCompositeOperation = "lighter";
      parts = parts.filter((p) => (p.life += dt) < p.max);
      for (const p of parts) {
        const k = p.life / p.max;
        p.x += (p.vx + Math.sin(now / 110 + p.ph) * (p.spark ? 10 : 46)) * dt;
        p.y += p.vy * dt; if (!p.spark) p.vy -= 220 * dt;
        const size = (p.spark ? p.size : p.size * (1 - k * .78)) / SCALE;   // tongues taper as they rise
        hx.globalAlpha = Math.pow(1 - k, p.spark ? .6 : 1.25) * p.heat;
        hx.drawImage(blob, p.x / SCALE - size, p.y / SCALE - size, size * 2, size * 2);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hc);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (parts.length || now - lastMove < 220) raf = requestAnimationFrame(tick); else running = false;
    };

    const onMove = (e) => {
      if (!activeRef.current) { lx = ly = null; return; }
      const x = e.clientX, y = e.clientY;
      if (lx === null) { lx = x; ly = y; }
      const d = Math.hypot(x - lx, y - ly), steps = Math.max(1, Math.min(12, Math.round(d / 10)));
      for (let s = 1; s <= steps; s++) spawn(lx + ((x - lx) * s) / steps, ly + ((y - ly) * s) / steps, false);
      lx = mx = x; ly = my = y; lastMove = performance.now();
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    };
    const onLeave = () => { lx = ly = null; lastMove = -1e9; };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className={`flame-trail ${active ? "on" : ""}`} aria-hidden />;
}
