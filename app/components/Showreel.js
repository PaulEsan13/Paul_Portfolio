"use client";
import { useRef, useState } from "react";

// Showreel: plays silently in a loop; click to restart it with sound, click again to mute.
const SHOWREEL_SRC = "/video/showreel.mp4";
const SHOWREEL_POSTER = "/video/showreel-poster.jpg";

export default function Showreel() {
  const ref = useRef(null);
  const video = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });
  const [sound, setSound] = useState(false);

  const toggle = () => {
    const v = video.current; if (!v) return;
    if (!sound) { v.currentTime = 0; v.muted = false; v.play(); setSound(true); }
    else { v.muted = true; setSound(false); }
  };

  return (
    <section
      className="reel"
      ref={ref}
      onClick={toggle}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, show: true });
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, show: false }))}
    >
      <video
        ref={video}
        className="reel-media"
        src={SHOWREEL_SRC}
        poster={SHOWREEL_POSTER}
        autoPlay muted loop playsInline preload="metadata"
      />
      <div className="reel-caption">
        <span>Paul Esan</span>
        <span className="muted">Brand identity &amp; art direction</span>
      </div>
      <span
        className="reel-cursor"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, opacity: pos.show ? 1 : 0 }}
      >
        {sound ? "● Mute" : "● Play with sound"}
      </span>
    </section>
  );
}
