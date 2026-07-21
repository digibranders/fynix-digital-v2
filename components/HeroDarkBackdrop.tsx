export default function HeroDarkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
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

      {/* Corner crop marks */}
      <span className="absolute top-24 left-6 md:top-28 md:left-10 h-4 w-4 border-l border-t border-white/15" />
      <span className="absolute top-24 right-6 md:top-28 md:right-10 h-4 w-4 border-r border-t border-white/15" />
      <span className="absolute bottom-6 left-6 md:bottom-10 md:left-10 h-4 w-4 border-l border-b border-white/15" />
      <span className="absolute bottom-6 right-6 md:bottom-10 md:right-10 h-4 w-4 border-r border-b border-white/15" />
    </div>
  );
}
