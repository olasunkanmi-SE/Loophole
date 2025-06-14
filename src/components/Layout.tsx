import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header can go here if needed in the future */}
      <main className="flex-grow container mx-auto p-4">{children}</main>
      {/* Footer can go here if needed in the future */}
    </div>
  );
}
