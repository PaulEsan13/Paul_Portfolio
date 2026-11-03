import Link from "next/link";

const featured = [
  { title: "AshCorp", tag: "Brand identity" },
  { title: "Zentai", tag: "Brand identity" },
  { title: "Project three", tag: "Coming soon" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1 className="reveal">
          Brand identities for tech and fashion — built to grow.
        </h1>
        <p className="lead">
          Paul Lesson is a brand identity designer and art director based in Lagos.
        </p>
      </section>

      <section className="grid">
        {featured.map((p) => (
          <Link href="/work" key={p.title} className="card">
            <div className="thumb" />
            <h3>{p.title}</h3>
            <span>{p.tag}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
