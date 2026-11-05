"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Placeholder projects — replace text and add images to /public later.
const PROJECTS = [
  { name: "AshCorp", line: "One Source, Many Worlds — identity for the holding company behind a family of fashion, beauty and lifestyle brands.", tags: "Brand identity · Strategy · Art direction", tone: "#2a2a2a", href: "/work/ashcorp", img: "/work/ashcorp/13.webp" },
  { name: "Zentai", line: "Identity and art direction for a new brand.", tags: "Brand identity · Art direction", tone: "#333" },
  { name: "Project three", line: "Case study coming soon.", tags: "Brand identity", tone: "#242424" },
];

export default function WorkList() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const p = PROJECTS[active];
  return (
    <section className="work">
      <div className="work-left">
        <div className="work-sticky">
          <span className="eyebrow">Selected work</span>
          <h3 key={p.name} className="work-name">{p.name}</h3>
          <p key={p.name + "l"} className="work-line">{p.line}</p>
          <span className="muted small">{p.tags}</span>
          <Link href={p.href || "/work"} className="link">{p.href ? "View case study →" : "All projects →"}</Link>
        </div>
      </div>
      <div className="work-right">
        {PROJECTS.map((pr, i) => (
          <Link
            href={pr.href || "/work"}
            key={pr.name}
            data-i={i}
            ref={(el) => (refs.current[i] = el)}
            className={`work-card ${i === active ? "on" : ""}`}
            style={{ background: pr.img ? `${pr.tone} url(${pr.img}) center/cover` : pr.tone }}
          >
            {!pr.img && <span>{pr.name}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
