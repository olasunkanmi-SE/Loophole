
import { type ReactNode } from "react";
import MobileContainer from "./MobileContainer";
import SlideMenuButton from "./SlideMenu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SlideMenuButton />
      <MobileContainer>
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </MobileContainer>
    </div>
  );
}
