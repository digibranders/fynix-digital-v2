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
    paper: "bg-background-soft text-primary",
    "paper-2": "bg-background-soft text-primary",
    surface: "bg-white text-primary",
    ink: "bg-primary text-white",
  };

  return (
    <section
      id={id}
      className={`py-20 md:py-28 lg:py-32 ${bg[variant]} ${
        borderBottom ? "border-b border-border" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};
