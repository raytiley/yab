import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";

export default function Shell({ children }: { children?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0d0d0d] to-[#1a1a1a] text-[#00ff99] font-mono">
      {/* Top Navbar */}
      <header className="border-b border-[#00ff99]/30 bg-[#0d0d0d]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <Link
            to="/"
            className="block text-2xl font-bold tracking-tight hover:tracking-wider transition-all"
          >
            <span className="text-[#00ccff]">&lt;</span>
            raytiley.com
            <span className="text-[#00ccff]">/&gt;</span>
          </Link>
          <button
            className="sm:hidden text-[#00ff99]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className="hidden sm:flex gap-6 text-sm uppercase">
            <a href="/" className="hover:text-[#00ccff] transition-colors">
              Home
            </a>
            <a href="/posts" className="hover:text-[#00ccff] transition-colors">
              Posts
            </a>
            <a href="/about" className="hover:text-[#00ccff] transition-colors">
              About
            </a>
          </nav>
        </div>
        {menuOpen && (
          <nav className="sm:hidden border-t border-[#00ff99]/20 bg-[#0d0d0d]">
            <div className="flex flex-col p-4 gap-3">
              <a href="#" className="hover:text-[#00ccff] transition-colors">
                Home
              </a>
              <a href="#" className="hover:text-[#00ccff] transition-colors">
                Posts
              </a>
              <a href="#" className="hover:text-[#00ccff] transition-colors">
                About
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Main content area */}
      <main className="max-w-3xl mx-auto p-6">
        {children ? (
          children
        ) : (
          <div className="bg-[#111] border border-[#00ff99]/30 rounded-xl p-6 shadow-lg shadow-[#00ff99]/10">
            <h2 className="text-xl font-bold mb-2 text-[#00ccff]">
              Welcome to raytiley.com 📺
            </h2>
            <p className="text-[#b3ffec] mb-4">I miss GeoCities.</p>
            <div className="border-t border-[#00ff99]/20 my-4"></div>
            <p className="text-sm text-[#00ff99]/70">
              This layout is powered by{" "}
              <span className="text-[#00ccff]">ChatGPT</span>.
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
