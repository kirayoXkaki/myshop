import './global.css';
import type { ReactNode } from 'react';
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <Navbar />
        <div className="mx-auto max-w-5xl px-4">{children}</div>
      </body>
    </html>
  );
}

