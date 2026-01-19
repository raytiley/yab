export default function Offline() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        {/* Retro TV frame effect */}
        <div className="rounded-lg border-4 border-[#333] bg-[#1a1a1a] p-8">
          <div className="relative overflow-hidden rounded border border-[#00ccff]/30 bg-[#0a0a0a] px-8 py-12">
            {/* Scanlines overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,204,255,0.1)_2px,rgba(0,204,255,0.1)_4px)]" />
            </div>

            {/* Static noise animation */}
            <div className="pointer-events-none absolute inset-0 animate-pulse opacity-5">
              <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
            </div>

            {/* Content */}
            <div className="relative z-10 font-mono">
              <h1 className="mb-4 text-4xl font-bold text-[#00ccff]">
                NO SIGNAL
              </h1>
              <p className="mb-6 text-lg text-[#666]">
                You&apos;re currently offline
              </p>
              <div className="mb-6 flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-pulse rounded-full bg-[#00ff99]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TV controls */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#333]" />
              <div className="h-3 w-3 rounded-full bg-[#333]" />
            </div>
            <div className="h-2 w-2 rounded-full bg-[#00ff99] shadow-[0_0_8px_#00ff99]" />
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="rounded-md border border-[#00ccff] bg-transparent px-6 py-3 font-mono text-[#00ccff] transition-all hover:bg-[#00ccff] hover:text-[#0d0d0d]"
      >
        Try Again
      </button>

      <p className="mt-4 font-mono text-sm text-[#666]">
        Check your internet connection and try again
      </p>
    </div>
  );
}
