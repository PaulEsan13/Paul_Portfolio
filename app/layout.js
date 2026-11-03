import "./globals.css";
import Nav from "./components/Nav";

export const metadata = {
  title: "Paul Lesson — Brand Identity Designer",
  description:
    "Brand identity, art direction and design leadership for tech and fashion brands, startups and multinationals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Paul Lesson</span>
          <span>Lagos, Nigeria</span>
        </footer>
      </body>
    </html>
  );
}
