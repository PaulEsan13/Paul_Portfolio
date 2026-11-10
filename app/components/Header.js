"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HeatWordmark from "./HeatWordmark";
import MenuPill from "./MenuPill";
import FlameTrail from "./FlameTrail";
import Wordmark3D, { preload3D, wordmark3D } from "./Wordmark3D";

// Wordmark style on the home intro:
//   "heat" = thermal glow effect (red/orange), moves on hover
//   "swap" = letters swap to alternate glyphs on hover (previous version)
const WORDMARK_STYLE = "heat";
// true = hovering a letter shows a live 3D letter (gold, glass, steel, wood…) instead of the flat glyph swap
const LETTERS_3D = true;

// Letters of the name. `keep` = stays when the name collapses to "PE".
// `alt` = placeholder swap shown on hover — replace with Paul's own glyphs/images later.
const LETTERS = [
  { ch: "P", keep: true, alt: "◐" },
  { ch: "A", alt: "△" },
  { ch: "U", alt: "∪", serif: true },
  { ch: "L", alt: "⌐" },
  { space: true },
  { ch: "E", keep: true, alt: "≡" },
  { ch: "S", alt: "§", serif: true },
  { ch: "A", alt: "✺" },
  { ch: "N", alt: "ɴ", serif: true },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [compact, setCompact] = useState(!isHome);
  const [swapped, setSwapped] = useState(-1);
  const wmRef = useRef(null);
  const heat = WORDMARK_STYLE === "heat" && isHome;
  const [use3D, setUse3D] = useState(false); // live 3D letters on hover (desktop only)

  useEffect(() => {
    const ok = !heat && LETTERS_3D && window.matchMedia("(hover: hover)").matches;
    setUse3D(ok);
    if (ok) preload3D([...new Set(LETTERS.filter((l) => l.ch).map((l) => l.ch))]);
  }, [heat]);
  useEffect(() => { if (compact) { wordmark3D.leaveAll(); setSwapped(-1); } }, [compact]);

  useEffect(() => {
    if (!isHome) { setCompact(true); return; }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > 40);
      // First scroll down from the intro: glide straight to the showreel.
      const reel = document.querySelector(".reel");
      if (reel && last <= 40 && y > last) {
        const top = reel.getBoundingClientRect().top + y;
        if (y < top - 4) window.scrollTo({ top, behavior: "smooth" });
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  let n = 0;
  return (
    <header className={`header ${compact ? "is-compact" : ""}`}>
      <Link href="/" ref={wmRef} className={`wordmark ${heat ? "heat" : ""}`} aria-label="Paul Esan — home">
        {heat && <HeatWordmark host={wmRef} compact={compact} />}
        {LETTERS.map((l, i) => {
          if (l.space) return <span key={i} className="wm-space" aria-hidden />;
          const delay = n++ * 70;
          const on = swapped === i;
          return (
            <span
              key={i}
              aria-hidden
              className={`wm-letter ${l.keep ? "keep" : "drop"} ${on ? (use3D && !compact ? "swapped three" : "swapped") : ""} ${l.serif && on ? "serif" : ""}`}
              style={{ animationDelay: `${delay}ms` }}
              onMouseEnter={(ev) => {
                if (heat || compact) return;
                setSwapped(i);
                if (use3D) wordmark3D.enter(i, l.ch, ev.currentTarget.getBoundingClientRect());
              }}
              onMouseLeave={() => { setSwapped((s) => (s === i ? -1 : s)); if (use3D) wordmark3D.leave(i); }}
            >
              <span className="wm-base">{l.ch}</span>
              <span className="wm-alt">{l.alt}</span>
            </span>
          );
        })}
      </Link>
      {use3D && <Wordmark3D />}
      <FlameTrail active />
      <MenuPill show={compact} />
      <nav className="nav">
        <Link href="/work">Work</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
