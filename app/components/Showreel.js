"use client";
import { useRef, useState } from "react";

// Swap SHOWREEL_SRC for the real reel (e.g. "/showreel.mp4" in /public) when it's ready.
const SHOWREEL_SRC = null;

export default function Showreel() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });

  return (
    <section
      className="reel"
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, show: true });
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, show: false }))}
    >
      {SHOWREEL_SRC ? (
        <video className="reel-media" src={SHOWREEL_SRC} autoPlay muted loop playsInline />
      ) : (
        <div className="reel-media reel-placeholder" />
      )}
      <div className="reel-caption">
        <span>Paul Esan</span>
        <span className="muted">Brand identity &amp; art direction</span>
      </div>
      <span
        className="reel-cursor"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, opacity: pos.show ? 1 : 0 }}
      >
        ● Play reel
      </span>
    </section>
  );
}
