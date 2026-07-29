export default function HeroDarkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* ── Fine line-grid ──
          Warm copper-tinted gridlines at low opacity.
          Masked with a radial fade so the grid dissolves toward edges,
          preventing the "tiled wallpaper" effect. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(233,175,136,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(233,175,136,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 70% 80% at 50% 45%, black 10%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 80% at 50% 45%, black 10%, transparent 80%)",
        }}
      />

      {/* ── Slow drifting shimmer ──
          A large, very subtle warm glow that drifts across the grid
          giving the surface a living, premium quality without distraction. */}
      <div
        className="hero-shimmer absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 50% 50%, rgba(233,175,136,0.06), transparent 70%)",
        }}
      />

      {/* Radial accent glow, top-right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(233,175,136,0.18), transparent 55%)",
        }}
      />
      {/* Soft vignette bottom-left for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 90%, rgba(0,0,0,0.35), transparent 60%)",
        }}
      />
    </div>
  );
}
