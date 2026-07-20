"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColorBase;
  uniform vec3  uColorSoft;
  uniform vec3  uColorNavy;
  uniform vec3  uColorGold;
  uniform float uIntensity;

  varying vec2 vUv;

  // Cheap value noise + fbm - enough for a flowing mesh gradient.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2  u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-corrected coords so the pattern doesn't stretch.
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(vUv.x * aspect, vUv.y) * 1.6;

    float t = uTime * 0.08;

    // Domain warping - this is what makes it look like a "flowing mesh".
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t),
      fbm(p + vec2(5.2, 1.3) - t * 0.7)
    );
    vec2 r = vec2(
      fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 0.5),
      fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 0.4)
    );
    float n = fbm(p + 2.0 * r);

    // Base wash: soft cream lifts off pure white.
    vec3 col = mix(uColorBase, uColorSoft, smoothstep(0.0, 0.9, n));

    // Warm peach bloom (broad, soft) - primary accent wash.
    float peachA = smoothstep(0.30, 0.85, q.y) * smoothstep(0.20, 0.80, r.x);
    col = mix(col, uColorGold, peachA * 0.55);

    // Secondary peach pocket for depth - keeps the field brand-only.
    float peachB = smoothstep(0.55, 0.95, r.y) * smoothstep(0.30, 0.90, n);
    col = mix(col, uColorGold, peachB * 0.35);

    // Very gentle vignette - keeps corners calm, doesn't erase the effect.
    float d = distance(vUv, vec2(0.5));
    float vignette = smoothstep(0.55, 1.05, d);
    col = mix(col, uColorBase, vignette * 0.35);

    gl_FragColor = vec4(col, uIntensity);
  }
`;

type RGB = [number, number, number];

// Palette locked to globals.css. Kept as constants to avoid a per-frame parse.
const COLOR_BASE:  RGB = [0.988, 0.988, 0.984]; // #FCFCFB
const COLOR_SOFT:  RGB = [0.965, 0.961, 0.949]; // #F6F5F2
const COLOR_NAVY:  RGB = [0.047, 0.118, 0.180]; // #0C1E2E
const COLOR_GOLD:  RGB = [0.914, 0.686, 0.533]; // #E9AF88

export default function HeroBackdrop() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Guard against SSR + non-WebGL environments.
    if (typeof window === "undefined") return;
    // Backdrop is intentionally still - no rAF loop, one static frame only.
    const prefersReducedMotion = true;

    let disposed = false;
    let rafId = 0;
    let running = false;
    let cleanup: (() => void) | null = null;

    // Dynamic import keeps OGL out of the initial JS bundle.
    (async () => {
      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      if (disposed || !hostRef.current) return;

      const renderer = new Renderer({
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        powerPreference: "low-power",
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      host.appendChild(canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uTime:       { value: 0 },
          uResolution: { value: [1, 1] as [number, number] },
          uColorBase:  { value: COLOR_BASE },
          uColorSoft:  { value: COLOR_SOFT },
          uColorNavy:  { value: COLOR_NAVY },
          uColorGold:  { value: COLOR_GOLD },
          uIntensity:  { value: 1.0 },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        const rect = host.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h);
        program.uniforms.uResolution.value = [w, h];
      };
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const start = performance.now();
      const draw = (now: number) => {
        if (disposed) return;
        program.uniforms.uTime.value = (now - start) * 0.001;
        renderer.render({ scene: mesh });
        rafId = requestAnimationFrame(draw);
      };

      const play = () => {
        if (running || disposed) return;
        running = true;
        rafId = requestAnimationFrame(draw);
      };
      const pause = () => {
        if (!running) return;
        running = false;
        cancelAnimationFrame(rafId);
      };

      // Only animate when the hero is on-screen AND the tab is visible.
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? false;
          if (visible && document.visibilityState === "visible" && !prefersReducedMotion) {
            play();
          } else {
            pause();
            if (visible) renderer.render({ scene: mesh }); // one static frame
          }
        },
        { threshold: 0.01 },
      );
      io.observe(host);

      const onVisibility = () => {
        if (document.visibilityState === "visible" && !prefersReducedMotion) play();
        else pause();
      };
      document.addEventListener("visibilitychange", onVisibility);

      // Reduced-motion users get one static frame - no rAF loop at all.
      if (prefersReducedMotion) {
        renderer.render({ scene: mesh });
      }

      cleanup = () => {
        pause();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        try {
          const loseCtx = gl.getExtension("WEBGL_lose_context");
          loseCtx?.loseContext();
        } catch {
          /* noop */
        }
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    })().catch(() => {
      /* If OGL fails to load, we silently fall back to the CSS backdrop below. */
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* WebGL host - mounts the OGL canvas. Behind everything else, dialed
          down so the peach wash sits softly behind the copy. */}
      <div ref={hostRef} className="absolute inset-0 z-0 opacity-50" />

      <span className="absolute top-24 left-6 md:top-28 md:left-10 h-4 w-4 border-l border-t border-border z-10" />
      <span className="absolute top-24 right-6 md:top-28 md:right-10 h-4 w-4 border-r border-t border-border z-10" />
      <span className="absolute bottom-6 left-6 md:bottom-10 md:left-10 h-4 w-4 border-l border-b border-border z-10" />
      <span className="absolute bottom-6 right-6 md:bottom-10 md:right-10 h-4 w-4 border-r border-b border-border z-10" />
    </div>
  );
}
