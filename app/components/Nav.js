import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="logo">Paul Lesson</Link>
      <nav>
        <Link href="/work">Work</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
