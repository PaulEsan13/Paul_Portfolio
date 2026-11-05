"use client";
// Live 3D letter that appears when the cursor touches a letter of the name.
// Loads Three.js lazily, picks a random material, swings round to a random angle and tilts with the mouse.
import { useEffect, useRef } from "react";

const MATERIALS = ["gold", "glass", "stainless", "wood", "steel"];
let engine = null; // shared between mounts

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

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 5.2);

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
      // "glass": clear, see-through body with bright edge reflections (works on a transparent page background)
      glass: new THREE.MeshPhysicalMaterial({ color: 0xcfe3ff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.32,
        side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 3, clearcoat: 1, clearcoatRoughness: 0.02,
        iridescence: 0.35, iridescenceIOR: 1.4, specularIntensity: 1, ior: 1.6 }),
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

// Warm up after the page has loaded so the first hover is instant.
export function preload3D(ch) {
  const go = () => getEngine().then((e) => e.loadLetter(ch)).catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1500);
}

export default function Letter3D({ ch, rect, active }) {
  const holder = useRef(null);
  const state = useRef({ active, rect });
  state.current.active = active; state.current.rect = rect;

  useEffect(() => {
    let raf, mesh, alive = true, e;
    const s = { ry: 0, rx: 0, vy: 0, vx: 0, ty: 0, tx: 0, scale: 0, mx: 0, my: 0 };
    const onMove = (ev) => {
      const r = state.current.rect; if (!r) return;
      s.mx = ((ev.clientX - (r.left + r.width / 2)) / r.width);
      s.my = ((ev.clientY - (r.top + r.height / 2)) / r.height);
    };
    window.addEventListener("mousemove", onMove);

    getEngine().then(async (eng) => {
      if (!alive) return; e = eng;
      const geo = await e.loadLetter(ch);
      if (!alive) return;
      const kind = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
      mesh = new e.THREE.Mesh(geo, e.mats[kind]);
      e.scene.add(mesh);
      holder.current.appendChild(e.renderer.domElement);
      // enter: start turned away, swing round to a random resting angle
      const dir = Math.random() < 0.5 ? -1 : 1;
      s.ry = dir * (Math.PI * (0.9 + Math.random() * 0.8));
      s.rx = (Math.random() - 0.5) * 0.8;
      s.ty = (Math.random() - 0.5) * 1.1;
      s.tx = (Math.random() - 0.5) * 0.5;
      let last = performance.now();
      const tick = (now) => {
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        const on = state.current.active;
        // spring towards target angle (+ mouse tilt)
        const ty = s.ty + s.mx * 0.9, tx = s.tx + s.my * 0.6;
        s.vy += ((ty - s.ry) * 60 - s.vy * 9) * dt; s.ry += s.vy * dt;
        s.vx += ((tx - s.rx) * 60 - s.vx * 9) * dt; s.rx += s.vx * dt;
        s.scale += ((on ? 1 : 0) - s.scale) * Math.min(dt * 10, 1);
        mesh.rotation.set(s.rx, s.ry, 0);
        mesh.scale.setScalar(Math.max(s.scale, 0.0001));
        const r = state.current.rect;
        if (r) {
          const size = Math.round(r.height * 1.7);
          if (e.renderer.domElement.width !== Math.round(size * e.renderer.getPixelRatio())) e.renderer.setSize(size, size);
          holder.current.style.cssText = `position:fixed;left:${r.left + r.width/2 - size/2}px;top:${r.top + r.height/2 - size/2}px;width:${size}px;height:${size}px;pointer-events:none;z-index:60`;
        }
        e.renderer.render(e.scene, e.camera);
        if (on || s.scale > 0.01) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      if (e && mesh) e.scene.remove(mesh);
    };
  }, [ch]);

  return <div ref={holder} aria-hidden />;
}
