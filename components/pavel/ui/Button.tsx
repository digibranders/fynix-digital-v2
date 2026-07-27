import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4B3A] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] whitespace-nowrap";

  const variants = {
    primary:
      "bg-[#0F0E0C] text-[#FDFBF5] hover:bg-[#1A1815] border border-[#0F0E0C]",
    secondary:
      "bg-[#2F4B3A] text-[#FDFBF5] hover:bg-[#25382C] border border-[#2F4B3A]",
    outline:
      "bg-transparent text-[#0F0E0C] hover:bg-[#EBE5D3] border border-[#0F0E0C]/25 hover:border-[#0F0E0C]/50",
    ghost:
      "bg-transparent text-[#0F0E0C] hover:bg-[#EBE5D3] border border-transparent",
  };

  const sizes = {
    sm: "px-4 py-2 text-[13px] rounded-[10px] tracking-tight",
    md: "px-5 py-2.5 text-sm rounded-[10px] tracking-tight",
    lg: "px-7 py-3.5 text-[15px] rounded-[10px] tracking-tight",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
