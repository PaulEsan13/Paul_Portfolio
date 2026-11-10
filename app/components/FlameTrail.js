"use client";
// Cursor flame for the black intro screen, drawn in a stylised "cel" look:
// hard-edged bands of colour (cream core → yellow → orange → brand red) with licking tongues
// that rise, tear off and burn out. Biggest at the cursor; the path behind it dies quickly.
import { useEffect, useRef } from "react";

// No fire over the name, the menu, or any visual (showreel, project images/cards, blog covers).
const NO_FIRE = ".wordmark, .pill, .reel, video, img, .work-card, .news-thumb, .blog-thumb, .work-index-item, .cs-img, .cs-grid, .post-video";

const SCALE = 2;          // heat map is drawn at 1/3 resolution, then sharpened by the shader
const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*.5+.5; uv.y = 1.-uv.y; gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
varying vec2 uv; uniform sampler2D heat; uniform float t; uniform vec2 res;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float band(float e, float h){ return smoothstep(e-.05, e+.05, h); }
void main(){
  vec2 q = uv * res / 90.;                         // noise scale in screen units
  float n1 = n(q*.9 + vec2(0., t*1.0));           // big licks, scrolling upward
  float n2 = n(q*2.0 + vec2(4.3, t*1.6));          // small ragged detail
  vec2 d = vec2((n1-.5)*.026 + (n2-.5)*.006, (n2-.5)*.008) * vec2(res.y/res.x, 1.);
  float h0 = texture2D(heat, uv + d).r;
  float h = h0 - ((n1-.5)*.10 + (n2-.5)*.035) * smoothstep(0., .12, h0); // tears the edge into tongues and loose flecks
  vec3 red = vec3(.886,0.,.067), ora = vec3(1.,.36,.04), yel = vec3(1.,.72,.12), cre = vec3(1.,.95,.74);
  vec3 col = red;
  col = mix(col, ora, band(.36, h));
  col = mix(col, yel, band(.60, h));
  col = mix(col, cre, band(.93, h));
  float a = band(.17, h);
  float glow = smoothstep(.03, .17, h0) * .18 * (1.-a); // faint warm halo outside the hard edge
  float o = .95; // overall strength — lower = subtler
  gl_FragColor = vec4((col*a + red*glow)*o, (a + glow)*o);
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

    let parts = [], raf = 0, running = false, last = 0, lx = null, ly = null, mx = 0, my = 0, lastMove = -1e9, t0 = performance.now(), emit = 0, fx = null, fy = null;

    // core = the big flame at the cursor; trail = smaller, shorter-lived fire left on the path
    const spawn = (x, y, core) => {
      if (parts.length > 900) return;
      const r = Math.random;
      parts.push(core
        ? { x: x + (r() - .5) * 14, y: y + (r() - .5) * 6, vx: (r() - .5) * 50, vy: -(110 + r() * 120), life: 0, max: .7 + r() * .5, size: 26 + r() * 22, heat: .13, ph: r() * 6.28 }
        : { x: x + (r() - .5) * 8, y: y + (r() - .5) * 8, vx: (r() - .5) * 30, vy: -(55 + r() * 70), life: 0, max: .5 + r() * .4, size: 16 + r() * 13, heat: .14, ph: r() * 6.28 });
      if (core && r() < .025) // sparks
        parts.push({ x, y, vx: (r() - .5) * 90, vy: -(130 + r() * 140), life: 0, max: .5 + r() * .4, size: 2.5 + r() * 2, heat: 1, ph: r() * 6.28, spark: true });
    };

    const tick = (now) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, .05)); last = now;
      if (fx === null) { fx = mx; fy = my; }
      const px = fx, py = fy, ease = 1 - Math.pow(0.0005, dt);   // frame-rate independent glide
      fx += (mx - fx) * ease; fy += (my - fy) * ease;
      if (activeRef.current && now - lastMove < 220) {
        emit += dt * 260;
        const cnt = Math.floor(emit); emit -= cnt;
        for (let i = 1; i <= cnt; i++) spawn(px + ((fx - px) * i) / cnt, py + ((fy - py) * i) / cnt, true);
      }
      hx.globalCompositeOperation = "source-over"; hx.globalAlpha = 1; hx.fillStyle = "#000"; hx.fillRect(0, 0, hc.width, hc.height);
      hx.globalCompositeOperation = "lighter";
      parts = parts.filter((p) => (p.life += dt) < p.max);
      for (const p of parts) {
        const k = p.life / p.max;
        p.x += (p.vx + Math.sin(now / 260 + p.ph) * (p.spark ? 6 : 20)) * dt;
        p.y += p.vy * dt; if (!p.spark) p.vy -= 110 * dt;
        const size = (p.spark ? p.size : p.size * (1 - k * .6)) / SCALE;   // tongues taper as they rise
        const fade = k < .15 ? k / .15 : 1;                                  // ease in, then smooth fade out
        hx.globalAlpha = fade * (1 - k) * (1 - k) * (3 - 2 * (1 - k)) * p.heat;
        hx.drawImage(blob, p.x / SCALE - size, p.y / SCALE - size, size * 2, size * 2);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hc);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (parts.length || now - lastMove < 220) raf = requestAnimationFrame(tick); else running = false;
    };

    const onMove = (e) => {
      // no flame on the name or on visuals — only on the black areas
      if (!activeRef.current || (e.target.closest && e.target.closest(NO_FIRE))) { lx = ly = null; lastMove = -1e9; return; }
      const x = e.clientX, y = e.clientY;
      if (lx === null) { lx = x; ly = y; }
      const d = Math.hypot(x - lx, y - ly), steps = Math.max(1, Math.min(12, Math.round(d / 10)));
      for (let s = 1; s <= steps; s++) spawn(lx + ((x - lx) * s) / steps, ly + ((y - ly) * s) / steps, false);
      if (performance.now() - lastMove > 300) { fx = x; fy = y; }   // fresh start: no glide from an old spot
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
