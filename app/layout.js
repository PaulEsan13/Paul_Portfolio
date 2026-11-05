import "@fontsource-variable/mona-sans/wdth.css";
import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Paul Esan — Brand Identity Designer & Art Director",
  description:
    "Brand identity, art direction and design leadership for tech and fashion brands, startups and multinationals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Paul Esan</span>
          <a href="mailto:pauldesign13@gmail.com">pauldesign13@gmail.com</a>
          <span>Lagos, Nigeria</span>
        </footer>
      </body>
    </html>
  );
}
