"use client";
// Flame trail that follows the cursor on the black intro screen.
// Hot (cream/amber) at the cursor, cooling through orange to the brand red, rising and fading out.
import { useEffect, useRef } from "react";

const STAGES = ["255,244,220", "255,190,90", "255,110,30", "226,0,17", "90,0,10"]; // cream → amber → orange → red → ember

export default function FlameTrail({ active }) {
  const ref = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current, ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    resize();

    // soft glow sprites, one per colour stage
    const sprites = STAGES.map((rgb) => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.35, `rgba(${rgb},.45)`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
    });

    let parts = [], raf = 0, running = false, last = 0, lx = null, ly = null;

    const spawn = (x, y, speed) => {
      if (parts.length > 420) return;
      const s = 16 + Math.random() * 20 + Math.min(speed, 40) * 0.35;
      parts.push({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 30, vy: -(35 + Math.random() * 70),
        life: 0, max: 0.8 + Math.random() * 0.7, size: s, ph: Math.random() * 6.28 });
    };

    const tick = (now) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = "lighter";
      const n = STAGES.length - 1;
      parts = parts.filter((p) => (p.life += dt) < p.max);
      for (const p of parts) {
        const t = p.life / p.max;
        p.x += (p.vx + Math.sin(now / 130 + p.ph) * 26) * dt;
        p.y += p.vy * dt; p.vy -= 60 * dt;                       // flames accelerate upward
        const size = p.size * (0.55 + 0.7 * Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5)) * (1 - t * 0.55) * dpr;
        const a = Math.pow(1 - t, 1.4) * 0.85;
        const f = Math.min(t * 1.25, 0.999) * n, i = Math.floor(f), k = f - i;
        ctx.globalAlpha = a * (1 - k); ctx.drawImage(sprites[i], p.x * dpr - size, p.y * dpr - size, size * 2, size * 2);
        ctx.globalAlpha = a * k; ctx.drawImage(sprites[i + 1], p.x * dpr - size, p.y * dpr - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;
      if (parts.length) raf = requestAnimationFrame(tick); else running = false;
    };

    const onMove = (e) => {
      if (!activeRef.current) { lx = ly = null; return; }
      const x = e.clientX, y = e.clientY;
      if (lx === null) { lx = x; ly = y; }
      const d = Math.hypot(x - lx, y - ly), steps = Math.max(1, Math.min(14, Math.round(d / 7)));
      for (let s = 1; s <= steps; s++) spawn(lx + ((x - lx) * s) / steps, ly + ((y - ly) * s) / steps, d);
      lx = x; ly = y;
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    };
    const onLeave = () => { lx = ly = null; };

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
