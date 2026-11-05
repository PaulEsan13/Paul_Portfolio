"use client";
// Live 3D letters for the PAUL ESAN wordmark.
// One transparent canvas over the page; each hovered letter pops up as a 3D letter in a random material,
// overshoots slightly, settles a little smaller than the flat letter, and tilts with the mouse.
import { useEffect, useRef } from "react";

const MATERIALS = ["gold", "glass", "stainless", "wood", "steel"];
const SETTLE = 0.7; // resting size relative to the flat letter
let engine = null;

function noiseCanvas(size, draw) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size); return c;
}

async function getEngine() {
  if (engine) return engine;
  engine = (async () => {
    const THREE = await import("three");
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);

    // ---- Studio environment (generated, no image files) ----
    // Soft-edged softboxes + a warm floor bounce + dark ceiling give metals and glass
    // smooth gradients and crisp highlights, like a product photo studio.
    const glowTex = (inner, outer) => new THREE.CanvasTexture(noiseCanvas(256, (x, s) => {
      const g = x.createRadialGradient(s / 2, s / 2, s * inner, s / 2, s / 2, s * outer);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "#000"); x.fillStyle = g; x.fillRect(0, 0, s, s);
    }));
    const softTex = glowTex(0.18, 0.5);
    const studio = new THREE.Scene();
    // backdrop sphere: dark top, mid-grey horizon, warm floor
    const sky = new THREE.CanvasTexture(noiseCanvas(512, (x, s) => {
      const g = x.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, "#0b0b0b"); g.addColorStop(0.4, "#2a2a2a"); g.addColorStop(0.5, "#8a847d");
      g.addColorStop(0.58, "#3a3029"); g.addColorStop(1, "#4a3424"); x.fillStyle = g; x.fillRect(0, 0, s, s);
    }));
    sky.colorSpace = THREE.SRGBColorSpace;
    studio.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })));
    const soft = (w, h, x, y, z, v, tint = 0xffffff) => {
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(v), map: softTex, side: THREE.DoubleSide,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.lookAt(0, 0, 0); studio.add(o);
    };
    soft(9, 3, 0, 7, 2, 7);                 // overhead strip
    soft(3, 10, -8, 1, 3, 5);               // left tall softbox
    soft(3, 9, 8, 0, -2, 4, 0xffe2c8);      // warm right kicker
    soft(7, 7, 3, 2, 9, 5);                 // front key
    soft(5, 5, -5, -2, 8, 2.5);             // low front fill
    soft(14, 3, 0, -2, -9, 1.5, 0xffd6b0);  // warm back rim
    scene.environment = pmrem.fromScene(studio, 0.01).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 4, 5); scene.add(key);

    // ---- Light-weight procedural textures ----
    const rand = (a) => { let t = a; return () => ((t = Math.sin(t * 9301 + 49297) * 233280) - Math.floor(t)); };
    const wood = new THREE.CanvasTexture(noiseCanvas(1024, (x, s) => {
      const r = rand(7);
      for (let y = 0; y < s; y++) {
        const w = y + Math.sin(y * 0.011) * 22 + Math.sin(y * 0.047) * 5;
        const ring = 0.5 + 0.5 * Math.sin(w * 0.16);
        const late = Math.pow(ring, 3);
        const R = 150 - late * 70 + Math.sin(y * 0.003) * 12, G = 92 - late * 48, B = 52 - late * 30;
        x.fillStyle = `rgb(${R|0},${G|0},${B|0})`; x.fillRect(0, y, s, 1);
      }
      for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(40,18,6,${r() * 0.1})`; x.fillRect(r() * s, r() * s, 30 + r() * 220, 1); }
      for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(255,220,180,${r() * 0.05})`; x.fillRect(r() * s, r() * s, 20 + r() * 120, 1); }
    }));
    wood.colorSpace = THREE.SRGBColorSpace; wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.anisotropy = 8;
    const brushed = new THREE.CanvasTexture(noiseCanvas(512, (x, s) => {
      const r = rand(3); x.fillStyle = "#808080"; x.fillRect(0, 0, s, s);
      for (let i = 0; i < 6000; i++) { const g = 60 + r() * 150; x.fillStyle = `rgba(${g},${g},${g},.25)`; x.fillRect(0, r() * s, s, 0.6 + r()); }
    }));
    brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping;
    const smudge = new THREE.CanvasTexture(noiseCanvas(256, (x, s) => {
      const r = rand(11); x.fillStyle = "#3a3a3a"; x.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 10 + r() * 40); g.addColorStop(0, "rgba(140,140,140,.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
        x.save(); x.translate(r() * s, r() * s); x.fillStyle = g; x.fillRect(-50, -50, 100, 100); x.restore(); }
    }));
    smudge.wrapS = smudge.wrapT = THREE.RepeatWrapping;

    const mats = {
      // polished gold with faint smudges
      gold: new THREE.MeshPhysicalMaterial({ color: 0xffcf73, metalness: 1, roughness: 0.26, roughnessMap: smudge, envMapIntensity: 1.3 }),
      // mirror-polished stainless
      stainless: new THREE.MeshPhysicalMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.2, roughnessMap: smudge, envMapIntensity: 1.6 }),
      // solid glass block: deep body, bright edges, slight rainbow sheen
      glass: new THREE.MeshPhysicalMaterial({ color: 0x1d2b30, metalness: 0.0, roughness: 0.0, ior: 1.9,
        clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 4, specularIntensity: 1, specularColor: new THREE.Color(0xffffff),
        iridescence: 0.45, iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 600],
        sheen: 1, sheenRoughness: 0.25, sheenColor: new THREE.Color(0x9fdcff) }),
      // oiled walnut with satin lacquer
      wood: new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.25, bumpMap: wood, bumpScale: 0.8 }),
      // brushed industrial steel
      steel: new THREE.MeshPhysicalMaterial({ color: 0xa4a7ac, metalness: 1, roughness: 0.48, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.35, envMapIntensity: 1.5 }),
    };

    const camera = new THREE.PerspectiveCamera(18, 1, 1, 200);
    camera.position.set(0, 0, 40);

    const loader = new GLTFLoader();
    const cache = {};
    const loadLetter = (ch) => cache[ch] || (cache[ch] = loader.loadAsync(`/models/letters/${ch}.glb`).then((g) => {
      let mesh; g.scene.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });
      const geo = mesh.geometry; geo.computeBoundingBox(); geo.center();
      const size = new THREE.Vector3(); geo.boundingBox.getSize(size);
      geo.scale(1.6 / size.y, 1.6 / size.y, 1.6 / size.y);
      // simple box UVs so the wood grain wraps the letter
      const pos = geo.attributes.position, nor = geo.attributes.normal, uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
        let u, v;
        if (nz >= nx && nz >= ny) { u = pos.getX(i); v = pos.getY(i); }        // front / back
        else if (nx >= ny) { u = pos.getZ(i); v = pos.getY(i); }              // left / right sides
        else { u = pos.getX(i); v = pos.getZ(i); }                            // top / bottom
        uv[i*2] = u * 0.45; uv[i*2+1] = v * 0.45;
      }
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      return geo;
    }));

    return { THREE, renderer, scene, camera, mats, loadLetter };
  })();
  return engine;
}

export function preload3D(chars) {
  const go = () => getEngine().then((e) => chars.forEach((c) => e.loadLetter(c))).catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1500);
}

// ---- controller used by the Header ----
const items = new Map(); // id -> instance
let wake = () => {};
let lastMat = {};
export const wordmark3D = {
  enter(id, ch, rect) {
    let it = items.get(id);
    if (!it) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      it = { id, ch, mesh: null, scale: 0, vs: 0,
        ry: dir * Math.PI * (0.7 + Math.random() * 0.6), rx: (Math.random() - 0.5) * 0.9, vy: 0, vx: 0 };
      items.set(id, it);
    }
    let kind; do { kind = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]; } while (kind === lastMat[ch] && MATERIALS.length > 1);
    if (typeof window !== "undefined" && window.__forceMat) kind = window.__forceMat; // for testing
    lastMat[ch] = kind; it.kind = kind; it.matDirty = true;
    it.rect = rect; it.active = true;
    it.ty = (Math.random() - 0.5) * 1.2; it.tx = (Math.random() - 0.5) * 0.5;
    wake();
  },
  leave(id) { const it = items.get(id); if (it) { it.active = false; wake(); } },
  leaveAll() { items.forEach((it) => (it.active = false)); wake(); },
};

export default function Wordmark3D() {
  const holder = useRef(null);
  useEffect(() => {
    let raf = 0, running = false, alive = true, e, mx = -1e4, my = -1e4, last = 0;
    const onMove = (ev) => { mx = ev.clientX; my = ev.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    const resize = () => {
      if (!e) return;
      e.renderer.setSize(window.innerWidth, window.innerHeight);
      e.camera.aspect = window.innerWidth / window.innerHeight; e.camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
      const H = window.innerHeight, W = window.innerWidth;
      const worldH = 2 * e.camera.position.z * Math.tan((e.camera.fov * Math.PI) / 360);
      const wpp = worldH / H; // world units per pixel
      let any = false;
      items.forEach((it) => {
        if (!it.geo) {
          e.loadLetter(it.ch).then((g) => { it.geo = g; });
          if (!it.active) { items.delete(it.id); }
          any = any || it.active; return;
        }
        if (!it.mesh) { it.mesh = new e.THREE.Mesh(it.geo, e.mats[it.kind]); e.scene.add(it.mesh); }
        if (it.matDirty) { it.mesh.material = e.mats[it.kind]; it.matDirty = false; }
        const r = it.rect, cx = r.left + r.width / 2, cy = r.top + r.height * 0.56;
        // springs: scale overshoots then settles; rotation swings round and follows the mouse
        const target = it.active ? SETTLE : 0;
        it.vs += ((target - it.scale) * 170 - it.vs * (it.active ? 13 : 22)) * dt;
        it.scale = Math.max(0, it.scale + it.vs * dt);
        const nx = Math.max(-1.5, Math.min(1.5, (mx - cx) / r.width));
        const ny = Math.max(-1.5, Math.min(1.5, (my - cy) / r.height));
        const ty = it.ty + (it.active ? nx * 0.8 : 0), tx = it.tx + (it.active ? ny * 0.5 : 0);
        it.vy += ((ty - it.ry) * 38 - it.vy * 8.5) * dt; it.ry += it.vy * dt;
        it.vx += ((tx - it.rx) * 38 - it.vx * 8.5) * dt; it.rx += it.vx * dt;
        const s = (r.height * 0.95 * it.scale * wpp) / 1.6;
        it.mesh.scale.setScalar(Math.max(s, 1e-4));
        it.mesh.rotation.set(it.rx, it.ry, 0);
        it.mesh.position.set((cx - W / 2) * wpp, -(cy - H / 2) * wpp, 0);
        const moving = it.active || it.scale > 0.002 || Math.abs(it.vs) > 0.01;
        if (!moving) { e.scene.remove(it.mesh); items.delete(it.id); }
        any = any || moving;
      });
      e.renderer.render(e.scene, e.camera);
      if (any && alive) raf = requestAnimationFrame(tick); else running = false;
    };

    getEngine().then((eng) => {
      if (!alive) return; e = eng;
      const c = e.renderer.domElement;
      c.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
      holder.current.appendChild(c);
      resize();
      wake = () => { if (!running && alive) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };
      if (items.size) wake();
    });

    return () => {
      alive = false; cancelAnimationFrame(raf); wake = () => {};
      window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", resize);
    };
  }, []);
  return <div ref={holder} aria-hidden />;
}
