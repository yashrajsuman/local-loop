import type React from "react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { LocationProvider } from "@/contexts/location-context";
import { LocationPermissionModal } from "@/components/location-permission-modal";
import { AutoLocationPrompt } from "@/components/auto-location-prompt";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LocationProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Toaster />
            </div>
            <LocationPermissionModal />
            <AutoLocationPrompt />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
