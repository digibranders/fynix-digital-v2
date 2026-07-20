"use client";

/**
 * HeroCards - the editorial composition that sits under the hero copy.
 *
 * Layout intent (matches the sketch):
 *   1. A large italic "fynix" wordmark bleeds off the right edge, behind
 *      everything, at very low opacity - an editorial watermark.
 *   2. The Session card sits on the left, laid flat as if resting on a desk.
 *   3. The Calendar card recedes into the right on the same plane.
 *
 * The cards are intentionally empty visual surfaces - decorative shapes that
 * anchor the composition without competing with the hero copy.
 */

const SESSION_TRANSFORM =
  "translateX(33px) translateY(-130px) rotateX(58deg) rotateZ(-24deg) translateZ(40px)";
const SESSION_ORIGIN = "50% 50%";
const CALENDAR_TRANSFORM =
  "translateX(-87px) translateY(-130px) rotateX(58deg) rotateZ(-24deg) translateZ(40px)";
const CALENDAR_ORIGIN = "50% 50%";

export default function HeroCards() {
  return (
    <div
      aria-hidden
      className="relative w-full h-[520px] md:h-[560px] lg:h-[600px] xl:h-[640px]"
      style={{
        perspective: "2600px",
        perspectiveOrigin: "45% 20%",
      }}
    >
      <FynixWatermark />

      <div
        className="absolute left-7 md:left-12 lg:left-7 top-4 md:top-6 lg:top-8 w-[320px] lg:w-[380px] xl:w-[440px] aspect-[6/7] rounded-2xl bg-white border border-border"
        style={{
          transform: SESSION_TRANSFORM,
          transformOrigin: SESSION_ORIGIN,
          transformStyle: "preserve-3d",
          boxShadow:
            "0 40px 80px -20px rgba(12,30,46,0.28), 0 12px 24px -12px rgba(12,30,46,0.18)",
        }}
      />

      <div
        className="absolute right-0 top-2 md:top-4 lg:top-6 w-[360px] xl:w-[440px] aspect-[6/7] rounded-2xl bg-white border border-border"
        style={{
          transform: CALENDAR_TRANSFORM,
          transformOrigin: CALENDAR_ORIGIN,
          transformStyle: "preserve-3d",
          boxShadow:
            "0 80px 160px -30px rgba(12,30,46,0.42), 0 24px 48px -20px rgba(12,30,46,0.25)",
        }}
      />
    </div>
  );
}

function FynixWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-visible">
      <span
        className="font-serif italic leading-[0.85] tracking-tighter select-none whitespace-nowrap"
        style={{
          fontSize: "clamp(240px, 28vw, 420px)",
          fontWeight: 500,
          color: "rgba(12, 30, 46, 0.11)",
          transform: "translateX(15%) translateY(-8%)",
        }}
      >
        fynix
      </span>
    </div>
  );
}
