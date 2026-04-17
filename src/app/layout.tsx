import type { Metadata } from "next";
import "./globals.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Sonic Admin",
  description: "Sonic Mega Logistics Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <ErrorBoundary>
          <PrimeReactProvider>
            {children}
          </PrimeReactProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
