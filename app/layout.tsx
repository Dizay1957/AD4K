import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { FloatingAIChat } from "@/components/ai/FloatingAIChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AD4K - Attention Done 4 You",
  description: "ADHD-friendly productivity application",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fix for body overflow and click issues
              if (typeof window !== 'undefined') {
                // Ensure body is always interactive
                const fixBodyOverflow = () => {
                  const hasOpenModal = document.querySelector('[class*="fixed"][class*="inset-0"][class*="z-50"]');
                  if (!hasOpenModal && document.body.style.overflow === 'hidden') {
                    document.body.style.overflow = '';
                    document.body.style.pointerEvents = '';
                  }
                };
                
                document.addEventListener('DOMContentLoaded', fixBodyOverflow);
                
                // Monitor for stuck overflow every 500ms
                setInterval(fixBodyOverflow, 500);
                
                // Also fix on any click (in case something is blocking)
                document.addEventListener('click', (e) => {
                  // If clicking on body and nothing happens, check for blocking elements
                  const target = e.target;
                  if (target === document.body || target === document.documentElement) {
                    fixBodyOverflow();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <FloatingAIChat />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '1rem',
                padding: '1rem',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
