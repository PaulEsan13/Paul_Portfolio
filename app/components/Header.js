"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HeatWordmark from "./HeatWordmark";

// Wordmark style on the home intro:
//   "heat" = thermal glow effect (red/orange), moves on hover
//   "swap" = letters swap to alternate glyphs on hover (previous version)
const WORDMARK_STYLE = "heat";

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
        {heat && <HeatWordmark host={wmRef} />}
        {LETTERS.map((l, i) => {
          if (l.space) return <span key={i} className="wm-space" aria-hidden />;
          const delay = n++ * 70;
          const on = swapped === i;
          return (
            <span
              key={i}
              aria-hidden
              className={`wm-letter ${l.keep ? "keep" : "drop"} ${on ? "swapped" : ""} ${l.serif && on ? "serif" : ""}`}
              style={{ animationDelay: `${delay}ms` }}
              onMouseEnter={() => !heat && setSwapped(i)}
              onMouseLeave={() => setSwapped(-1)}
            >
              <span className="wm-base">{l.ch}</span>
              <span className="wm-alt">{l.alt}</span>
            </span>
          );
        })}
      </Link>
      <nav className="nav">
        <Link href="/work">Work</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
