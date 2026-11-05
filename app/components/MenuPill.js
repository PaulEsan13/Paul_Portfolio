"use client";
// Koto-style compact menu: once the name collapses to PE, a dark pill appears around it
// showing the current page. Click it to drop down the full menu.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
// Add your other profiles here (Instagram, LinkedIn…)
const CHANNELS = [
  { href: "https://www.behance.net/gallery/254294061/Ashcorp-Group-Brand-Identity", label: "Behance" },
  { href: "mailto:pauldesign13@gmail.com", label: "Email" },
];

function current(path) {
  if (path === "/") return "Home";
  const hit = LINKS.filter((l) => l.href !== "/" && path.startsWith(l.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return hit ? hit.label : "Home";
}

export default function MenuPill({ show }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => { if (!show) setOpen(false); }, [show]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className={`pill ${show ? "show" : ""} ${open ? "open" : ""}`}>
      <button className="pill-bar" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
        <span className="pill-logo-space" />
        <span className="pill-page">{current(path)}</span>
        <span className="pill-icon" aria-hidden><i /><i /></span>
      </button>
      <div className="pill-panel" aria-hidden={!open}>
        <div className="pill-inner">
        <nav className="pill-links">
          {LINKS.filter((l) => l.href !== "/").map((l, i) => (
            <Link key={l.href} href={l.href} style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              className={current(path) === l.label ? "here" : ""} tabIndex={open ? 0 : -1}>{l.label}</Link>
          ))}
        </nav>
        <div className="pill-channels" style={{ transitionDelay: open ? "260ms" : "0ms" }}>
          <span>Channels</span>
          {CHANNELS.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" tabIndex={open ? 0 : -1}>{c.label}</a>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
