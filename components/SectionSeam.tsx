type NeutralTone = "white" | "soft";

type Props = {
  from?: NeutralTone;
  to?: NeutralTone;
  className?: string;
};

const TOKEN: Record<NeutralTone, string> = {
  white: "var(--background)",
  soft: "var(--background-soft)",
};

/**
 * Soft transition band between two neighbouring light-neutral sections.
 * Matches the fade used by hero gradients (`from-white to-background-soft`)
 * so section-to-section color changes no longer read as hard seams.
 */
export default function SectionSeam({
  from = "white",
  to = "soft",
  className = "",
}: Props) {
  return (
    <div
      aria-hidden
      className={`w-full h-10 md:h-14 -my-5 md:-my-7 ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${TOKEN[from]} 0%, ${TOKEN[to]} 100%)`,
      }}
    />
  );
}
