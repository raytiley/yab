import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";

export default function Shell({ children }: { children?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0d0d0d] to-[#1a1a1a] text-[#00ff99] font-mono">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-black/80 text-white px-3 py-2 rounded"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <header className="border-b border-[#00ff99]/30 bg-[#0d0d0d]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <Link
            to="/"
            className="block text-2xl font-bold tracking-tight hover:tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
          >
            <span className="text-[#00ccff]">&lt;</span>
            raytiley.com
            <span className="text-[#00ccff]">/&gt;</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="sm:hidden text-[#00ff99] p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff]"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
          >
            {menuOpen ? (
              <X size={24} aria-hidden="true" focusable="false" />
            ) : (
              <Menu size={24} aria-hidden="true" focusable="false" />
            )}
          </button>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden sm:flex text-sm uppercase">
            <ul className="flex gap-6">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav
            id="primary-nav"
            aria-label="Primary"
            className="sm:hidden border-t border-[#00ff99]/20 bg-[#0d0d0d]"
          >
            <ul className="flex flex-col p-4 gap-3 text-sm uppercase">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[#00ccff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ccff] rounded"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Main content area */}
      <main id="main" className="max-w-3xl mx-auto p-6">
        {children ? (
          children
        ) : (
          <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-6 shadow-lg shadow-[#00ff99]/10">
            <h2 className="text-xl font-bold mb-2 text-[#00ccff]">
              Welcome to raytiley.com 📺
            </h2>
            <p className="text-[#b3ffec] mb-4">I miss GeoCities.</p>
            <div className="border-t border-[#00ff99]/20 my-4" aria-hidden="true"></div>
            <p className="text-sm text-[#00ff99]/70">
              This layout is powered by <span className="text-[#00ccff]">ChatGPT</span>.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#00ff99]/20 text-center p-4 text-sm text-[#00ff99]">
        <p>© 2025 raytiley.com. Built with 🍺 and ☕️</p>
      </footer>
    </div>
  );
}
