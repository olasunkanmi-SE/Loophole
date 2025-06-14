
import { type ReactNode } from "react";
import MobileContainer from "./MobileContainer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MobileContainer>
        {children}
      </MobileContainer>
    </div>
  );
}
