import React from "react";

interface ReadingContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ReadingContainer: React.FC<ReadingContainerProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`mx-auto max-w-[740px] px-4 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
