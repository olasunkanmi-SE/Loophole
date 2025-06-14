
import { type ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className={`max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
