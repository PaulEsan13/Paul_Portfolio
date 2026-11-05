"use client";
import { useEffect, useRef } from "react";

// Thermal / heat-glow version of the wordmark, drawn with WebGL.
// Idle: a still, glowing "heat map" of the name. Hover: the heat flows and follows the cursor.
const PAD = 48; // room around the letters for the glow (CSS px)

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; uv.y = 1.0-uv.y; gl_Position = vec4(p,0.,1.); }`;

const FRAG = `
precision highp float;
varying vec2 uv;
uniform sampler2D tex;      // R = sharp text, G = medium blur, B = wide blur
uniform float t;            // flow time
uniform vec2 mouse;         // 0..1
uniform float hover;        // 0..1
uniform float reveal;       // 0..1 intro
uniform float aspect;

float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*n(p); p*=2.03; a*=.5; } return v; }

// black -> deep crimson -> brand red -> orange -> amber -> cream
vec3 ramp(float x){
  vec3 c0=vec3(0.), c1=vec3(.22,.0,.05), c2=vec3(.886,.0,.067), c3=vec3(1.,.42,.1), c4=vec3(1.,.77,.42), c5=vec3(1.,.97,.9);
  x=clamp(x,0.,1.);
  if(x<.18) return mix(c0,c1,x/.18);
  if(x<.42) return mix(c1,c2,(x-.18)/.24);
  if(x<.64) return mix(c2,c3,(x-.42)/.22);
  if(x<.84) return mix(c3,c4,(x-.64)/.20);
  return mix(c4,c5,(x-.84)/.16);
}

void main(){
  vec2 q = vec2(uv.x*aspect, uv.y);
  vec2 m = vec2(mouse.x*aspect, mouse.y);
  float d = distance(q, m);
  float near = exp(-d*d*6.) * hover;

  // moving heat field: patches of the name "melt" into blurry hot spots
  float f = fbm(q*1.8 + vec2(t*.35, -t*.18));
  float melt = smoothstep(.42, .74, f) + near * 1.1;
  melt = clamp(melt, 0., 1.);

  // warp the letters where they're hot
  vec2 w = vec2(fbm(q*3. + t*.5) - .5, fbm(q*3. + 7.3 - t*.4) - .5);
  vec2 st = uv + w * (.015 + .05*near) * melt;

  vec3 s = texture2D(tex, st).rgb;
  // stroke centres burn cream, edges fall off through amber, orange, red
  float body = s.r*.45 + s.g*.55;
  float core = mix(body, s.b*1.25, melt);
  float heat = core * (1. - .38*melt) + s.b*.42;
  heat = pow(clamp(heat*.97,0.,1.), 1.7);

  // intro: heat sweeps in left to right
  heat *= 1. - smoothstep(reveal*1.3 - .25, reveal*1.3 - .05, uv.x);

  float a = smoothstep(0., .22, heat);
  gl_FragColor = vec4(ramp(heat) * a, a);
}`;

export default function HeatWordmark({ host }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const el = host.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(prog, k);
    const uT = U("t"), uMouse = U("mouse"), uHover = U("hover"), uReveal = U("reveal"), uAspect = U("aspect");
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let W = 0, H = 0, dpr = 1;

    // Draw the name 3 times (sharp, medium blur, wide blur) and pack into R, G, B.
    const build = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round((r.width + PAD * 2) * dpr);
      H = Math.round((r.height + PAD * 2) * dpr);
      cv.width = W; cv.height = H;
      cv.style.width = W / dpr + "px"; cv.style.height = H / dpr + "px";
      gl.viewport(0, 0, W, H);

      const fs = parseFloat(getComputedStyle(el).fontSize) * dpr;
      const layer = (blur) => {
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const x = c.getContext("2d");
        x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
        x.filter = blur ? `blur(${blur * dpr}px)` : "none";
        x.fillStyle = "#fff";
        x.font = `800 semi-expanded ${fs}px "Mona Sans Variable"`;
        if ("fontStretch" in x) x.fontStretch = "semi-expanded";
        if ("letterSpacing" in x) x.letterSpacing = `${-0.01 * fs}px`;
        x.textBaseline = "alphabetic";
        const left = PAD * dpr, base = H - PAD * dpr - fs * 0.02;
        const w1 = x.measureText("PAUL").width;
        x.fillText("PAUL", left, base);
        x.fillText("ESAN", left + w1 + fs * 0.22, base);
        return x.getImageData(0, 0, W, H).data;
      };
      const a = layer(0), b = layer(fs / dpr * 0.035), c = layer(fs / dpr * 0.11);
      const out = new Uint8Array(W * H * 4);
      for (let i = 0; i < out.length; i += 4) { out[i] = a[i]; out[i + 1] = b[i]; out[i + 2] = c[i]; out[i + 3] = 255; }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, out);
      gl.uniform1f(uAspect, W / H);
    };

    let t = 3.0, hover = 0, hoverTarget = 0, mx = .5, my = .5, reveal = 0, raf, last = performance.now(), ready = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) reveal = 1;

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, .05); last = now;
      hover += (hoverTarget - hover) * Math.min(dt * 4, 1);
      if (!reduce) t += dt * (0.04 + hover * 0.9);   // barely moves idle, flows on hover
      if (reveal < 1) reveal = Math.min(1, reveal + dt * 0.9);
      if (ready) {
        gl.uniform1f(uT, t); gl.uniform1f(uHover, hover); gl.uniform1f(uReveal, reveal);
        gl.uniform2f(uMouse, mx, my);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      const r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height;
      hoverTarget = 1;
    };
    const onLeave = () => { hoverTarget = 0; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    let ro;
    document.fonts.load(`800 100px "Mona Sans Variable"`).then(() => {
      build(); ready = true;
      ro = new ResizeObserver(() => build());
      ro.observe(el);
    });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); ro && ro.disconnect();
      el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave);
    };
  }, [host]);

  return <canvas ref={canvasRef} className="heat-canvas" aria-hidden style={{ left: -PAD, top: -PAD }} />;
}
