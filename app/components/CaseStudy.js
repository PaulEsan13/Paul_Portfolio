"use client";
// Koto-style case study: a fixed left sidebar (title, meta, section index, Thanks card)
// and a wide visual column on the right that runs almost edge to edge.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -6% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-up ${on ? "in" : ""} ${className}`}>{children}</div>;
}

function Block({ b, label }) {
  if (b.type === "img")
    return <Reveal><img className="cs-img" src={b.src} alt="" loading="lazy" decoding="async" style={{ aspectRatio: b.ratio }} /></Reveal>;
  if (b.type === "grid")
    return <div className={`cs-grid cols-${b.items.length}`}>{b.items.map((it, i) => <Block key={i} b={it} />)}</div>;
  if (b.type === "video")
    return <Reveal><video className="cs-img" src={b.src} poster={b.poster} autoPlay muted loop playsInline style={{ aspectRatio: "16/9" }} /></Reveal>;
  if (b.type === "lead" || b.type === "text")
    return (
      <Reveal className="cs-text">
        <span className="cs-label">{b.label || label}</span>
        <div className="cs-copy">
          {b.title && <h3>{b.title}</h3>}
          {b.type === "lead" ? <p className="cs-lead">{b.text}</p> : b.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Reveal>
    );
  return null;
}

export default function CaseStudy({ project, sections }) {
  const [active, setActive] = useState(sections[0].id);
  const [thanks, setThanks] = useState(false);
  const refs = useRef({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.dataset.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article className="cs">
      <aside className="cs-side">
        <div className="cs-title">
          <h1>{project.title}</h1>
          <p>{project.subtitle}</p>
          <span className="cs-tag">{project.category} · {project.year}</span>
        </div>
        <nav className="cs-index">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""}>{s.label}</a>
          ))}
        </nav>
        <div className={`cs-thanks ${thanks ? "open" : ""}`}>
          <button onClick={() => setThanks((t) => !t)} aria-expanded={thanks}>
            <span>Thanks</span><span className="cs-plus" aria-hidden>+</span>
          </button>
          <div className="cs-thanks-body">
            <div>
              <p>{project.thanks}</p>
              <dl>
                <dt>Role</dt><dd>{project.role}</dd>
                <dt>Tools</dt><dd>{project.tools}</dd>
              </dl>
              <a className="link small" href={project.behance} target="_blank" rel="noreferrer">View on Behance ↗</a>
            </div>
          </div>
        </div>
      </aside>

      <div className="cs-main">
        {sections.map((s) => (
          <section key={s.id} id={s.id} data-id={s.id} ref={(el) => (refs.current[s.id] = el)} className="cs-section">
            {s.blocks.map((b, i) => <Block key={i} b={b} label={s.label} />)}
          </section>
        ))}

        <Link href={project.next.href} className="cs-next">
          <span className="cs-label">Next project</span>
          <div className="cs-copy">
            <span className="cs-next-name">{project.next.name}</span>
            <span className="muted">{project.next.note}</span>
          </div>
        </Link>
      </div>
    </article>
  );
}
