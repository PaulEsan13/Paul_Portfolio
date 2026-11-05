"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!isHome) { setCompact(true); return; }
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  let n = 0;
  return (
    <header className={`header ${compact ? "is-compact" : ""}`}>
      <Link href="/" className="wordmark" aria-label="Paul Esan — home">
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
              onMouseEnter={() => setSwapped(i)}
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
