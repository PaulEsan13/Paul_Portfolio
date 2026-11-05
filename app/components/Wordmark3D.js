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
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Studio environment: dark room with a few bright softboxes -> crisp, contrasty reflections
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0x050505);
    const box = (w, h, x, y, z, ry, rx, v, tint = 0xffffff) => {
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(v), side: THREE.DoubleSide });
      const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); studio.add(o);
    };
    box(6, 1.2, 0, 4, 2, 0, Math.PI / 2.4, 6);              // top strip
    box(1.2, 7, -5, 0, 1, Math.PI / 2.3, 0, 4);             // left strip
    box(1.6, 6, 5, 0.5, -1, -Math.PI / 2.2, 0, 3.5, 0xffe8d8); // warm right strip
    box(8, 3, 0, -1, -6, 0, 0, 1.2);                        // soft back fill
    box(3, 3, 2.5, 2, 6, Math.PI, 0, 2.5);                  // front key
    scene.environment = pmrem.fromScene(studio, 0.02).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe6d0, 1.2); rim.position.set(-4, 2, -3); scene.add(rim);

    const camera = new THREE.PerspectiveCamera(18, 1, 1, 200);
    camera.position.set(0, 0, 40);

    // light-weight procedural textures (no image files)
    const wood = new THREE.CanvasTexture(noiseCanvas(512, (x, s) => {
      for (let y = 0; y < s; y++) {
        const v = 0.5 + 0.5 * Math.sin(y * 0.09 + Math.sin(y * 0.013) * 6 + Math.sin(y * 0.002) * 12);
        const r = 70 + v * 95, g = 34 + v * 52, b = 14 + v * 22;
        x.fillStyle = `rgb(${r|0},${g|0},${b|0})`; x.fillRect(0, y, s, 1);
      }
      for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(30,12,4,${Math.random()*0.12})`; x.fillRect(Math.random()*s, Math.random()*s, 40 + Math.random()*120, 1); }
    }));
    wood.colorSpace = THREE.SRGBColorSpace; wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.rotation = Math.PI / 2;
    const brushed = new THREE.CanvasTexture(noiseCanvas(256, (x, s) => {
      x.fillStyle = "#888"; x.fillRect(0, 0, s, s);
      for (let i = 0; i < 2200; i++) { const g = 90 + Math.random() * 120; x.fillStyle = `rgba(${g},${g},${g},.35)`; x.fillRect(0, Math.random()*s, s, Math.random()*1.5); }
    }));
    brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping;

    const mats = {
      gold: new THREE.MeshPhysicalMaterial({ color: 0xffc35c, metalness: 1, roughness: 0.14 }),
      stainless: new THREE.MeshPhysicalMaterial({ color: 0xf5f7fa, metalness: 1, roughness: 0.17 }),
      // solid glass: opaque, cool-tinted body with crisp highlights and a slight rainbow sheen
      glass: new THREE.MeshPhysicalMaterial({ color: 0x5d8794, metalness: 0.1, roughness: 0.0, ior: 1.7,
        clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 3.4, specularIntensity: 1, specularColor: new THREE.Color(0xffffff),
        iridescence: 0.7, iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 600],
        sheen: 0.6, sheenRoughness: 0.3, sheenColor: new THREE.Color(0xbfeaff) }),
      wood: new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
      steel: new THREE.MeshPhysicalMaterial({ color: 0x8a8d92, metalness: 1, roughness: 0.38, roughnessMap: brushed, bumpMap: brushed, bumpScale: 0.6 }),
    };

    const loader = new GLTFLoader();
    const cache = {};
    const loadLetter = (ch) => cache[ch] || (cache[ch] = loader.loadAsync(`/models/letters/${ch}.glb`).then((g) => {
      let mesh; g.scene.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });
      const geo = mesh.geometry; geo.computeBoundingBox(); geo.center();
      const size = new THREE.Vector3(); geo.boundingBox.getSize(size);
      geo.scale(1.6 / size.y, 1.6 / size.y, 1.6 / size.y);
      // simple box UVs so the wood grain wraps the letter
      const pos = geo.attributes.position, uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) { uv[i*2] = pos.getX(i) * 0.6 + pos.getZ(i) * 0.6; uv[i*2+1] = pos.getY(i) * 0.6; }
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
