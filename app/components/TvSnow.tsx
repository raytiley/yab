import { useEffect, useRef } from "react";

/**
 * TVSnow — retro CRT/"bad signal" snow using Canvas2D.
 *
 * Fixes:
 *  - No more large per-frame crypto calls (which can hit 64KB getRandomValues limits).
 *  - Uses a PRNG seeded once from crypto (mulberry32) per mount.
 *  - Optional downscaled noise buffer for big canvases via `noiseScale` (default 2).
 *
 * Props:
 *  - width, height: logical canvas size (defaults to parent size if not provided)
 *  - fps: limit frames per second (default: unlimited rAF)
 *  - intensity: 0..1 amount of white pixels
 *  - scanlines: 0..1 strength of scanline darkening
 *  - vignette: 0..1 strength of edge falloff
 *  - rollingBar: boolean to add drifting bright bar
 *  - noiseScale: render noise at 1/x resolution for performance (default 2)
 *  - className: tailwind classes for wrapper
 */
export default function TVSnow({
  width,
  height,
  fps,
  intensity = 0.6,
  scanlines = 0.35,
  vignette = 0.4,
  rollingBar = true,
  noiseScale = 2,
  className = ""
}: {
  width?: number;
  height?: number;
  fps?: number;
  intensity?: number; // 0..1
  scanlines?: number; // 0..1
  vignette?: number; // 0..1
  rollingBar?: boolean;
  noiseScale?: number; // >=1
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const parent = parentRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    // Set device-pixel ratio for crispness
    const setSize = () => {
      const pr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = width || parent.clientWidth || 640;
      const h = height || Math.max(1, parent.clientHeight) || 360;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * pr);
      canvas.height = Math.floor(h * pr);
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
    };
    setSize();

    // Recompute on resize
    const ro = new ResizeObserver(setSize);
    ro.observe(parent);

    // Offscreen canvas for low-res noise then scale up for speed
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { alpha: false })!;

    // PRNG seeded once to avoid crypto quotas
    const seedFromCrypto = () => {
      try {
        const seedArr = new Uint32Array(1);
        window.crypto?.getRandomValues?.(seedArr);
        return seedArr[0] || ((Math.random() * 0xffffffff) >>> 0);
      } catch {
        return ((Math.random() * 0xffffffff) >>> 0);
      }
    };

    const mulberry32 = (a: number) => () => {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    let rand = mulberry32(seedFromCrypto());

    // For FPS limiting
    let lastTime = 0;
    const frameInterval = fps && fps > 0 ? 1000 / fps : 0;

    let rafId = 0;
    let running = true;
    let t = 0; // time in seconds

    const render = (now: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(render);
      if (frameInterval && now - lastTime < frameInterval) return;
      const dt = (now - lastTime) / 1000 || 0.016;
      lastTime = now;
      t += dt;

      const W = canvas.width;
      const H = canvas.height;

      const scale = Math.max(1, Math.floor(noiseScale));
      const nW = Math.max(2, Math.floor(W / scale));
      const nH = Math.max(2, Math.floor(H / scale));

      off.width = nW;
      off.height = nH;

      // Create (or reuse) ImageData at low resolution
      const img = octx.createImageData(nW, nH);
      const data = img.data; // Uint8ClampedArray

      // Dynamic params
      const barY = rollingBar ? Math.floor(((t * 80) % (nH + 200)) - 100) : -9999;

      let idx = 0;
      for (let y = 0; y < nH; y++) {
        const scanMul = 1 - scanlines * (y & 1 ? 1 : 0);
        const vy = (y / nH) * 2 - 1; // -1..1
        const y2 = vy * vy;
        for (let x = 0; x < nW; x++) {
          // base random 0..255 via PRNG
          const r = (rand() * 256) | 0;
          // Threshold + analog mix
          let luma = r;
          const threshold = 255 * (1 - intensity);
          if (r > threshold) luma = 255; else luma = (r * 0.5) | 0;

          // Horizontal mild jitter
          const j = ((x + ((t * 30 + y * 13) % 3)) | 0) & 0xff;
          luma = (luma * (200 + j)) >> 8;

          // Vignette (approx radial using y^2 + x^2)
          const vx = (x / nW) * 2 - 1; // -1..1
          const v = 1 - vignette * Math.min(1, (vx * vx + y2) * 0.6);
          luma = (luma * v * scanMul) | 0;

          // Rolling bright bar (mapped to low-res space)
          if (y > barY && y < barY + 8) {
            const b = 1.4 - Math.abs((y - barY - 4) / 6);
            luma = Math.min(255, (luma * (1 + b * 0.6)) | 0);
          }

          const lr = Math.min(255, (luma * 1.02) | 0);
          const lg = luma;
          const lb = Math.max(0, (luma * 0.98) | 0);

          data[idx++] = lr;
          data[idx++] = lg;
          data[idx++] = lb;
          data[idx++] = 255;
        }
      }

      octx.putImageData(img, 0, 0);

      // Scale up to main canvas with nearest-neighbor for crunchy noise
      ctx.save();
      (ctx as any).imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, nW, nH, 0, 0, W, H);

      // Subtle barrel/glow using compositing
      ctx.globalCompositeOperation = "overlay";
      const grd = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7);
      grd.addColorStop(0, "rgba(255,255,255,0.05)");
      grd.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    };

    rafId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [width, height, fps, intensity, scanlines, vignette, rollingBar, noiseScale]);

  return (
    <div
      ref={parentRef}
      className={
        "relative overflow-hidden rounded-2xl border border-emerald-400/40 shadow-[0_0_50px_rgba(16,255,176,0.15)] bg-black " +
        className
      }
    >
      {/* CRT Bezel */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-400/20" />
      {/* Canvas */}
      <canvas ref={canvasRef} className="block w-full h-[320px] sm:h-[420px] md:h-[520px]" />
      {/* Overlay UI lines (retro UI flavor) */}
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen bg-[linear-gradient(rgba(16,255,176,0.05)_1px,transparent_1px)] bg-[length:100%_2px]" />
    </div>
  );
}

/** Example usage inside your RetroBlogShell main area:
 *
 * <RetroBlogShell>
 *   <div className="max-w-3xl mx-auto p-6 space-y-6">
 *     <h2 className="text-xl font-bold text-cyan-400">Bad Signal Demo</h2>
 *     <TVSnow fps={30} intensity={0.65} scanlines={0.4} vignette={0.45} rollingBar noiseScale={2} className="mt-4" />
 *   </div>
 * </RetroBlogShell>
 */
