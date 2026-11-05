import Link from "next/link";

const WORK = [
  { name: "Ashcorp Group", tag: "Brand identity · 2026", href: "/work/ashcorp", img: "/work/ashcorp/13.webp" },
  { name: "Zentai", tag: "Coming soon" },
];

export default function Work() {
  return (
    <section className="page">
      <h1>Work</h1>
      <div className="work-index">
        {WORK.map((w) =>
          w.href ? (
            <Link key={w.name} href={w.href} className="work-index-item">
              <img src={w.img} alt="" />
              <h3>{w.name}</h3><span className="muted small">{w.tag}</span>
            </Link>
          ) : (
            <div key={w.name} className="work-index-item soon"><div className="ph" /><h3>{w.name}</h3><span className="muted small">{w.tag}</span></div>
          )
        )}
      </div>
    </section>
  );
}
