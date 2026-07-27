import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: "paper" | "paper-2" | "surface" | "ink";
  borderBottom?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  className = "",
  variant = "paper",
  borderBottom = true,
  ...props
}) => {
  const bg = {
    paper: "bg-[#F4EFE3] text-[#0F0E0C]",
    "paper-2": "bg-[#EBE5D3] text-[#0F0E0C]",
    surface: "bg-[#FDFBF5] text-[#0F0E0C]",
    ink: "bg-[#1A1815] text-[#F4EFE3]",
  };

  return (
    <section
      id={id}
      className={`py-20 md:py-28 lg:py-32 ${bg[variant]} ${
        borderBottom ? "border-b border-[#DDD3BC]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};
