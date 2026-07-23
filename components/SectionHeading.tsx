import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
};

export default function SectionHeading({ title, description, align = "left" }: Props) {
  const centered = align === "center";
  return (
    <div className={centered ? "max-w-3xl mx-auto text-center" : "max-w-3xl"}>
      <h2 className="font-serif text-4xl md:text-5xl text-primary font-medium">{title}</h2>
      {description ? (
        <p
          className={`text-text-muted text-base font-normal leading-relaxed mt-4 ${
            centered ? "" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
