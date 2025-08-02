import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impact Inbox",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body className={`${nunito.className} antialiased`}>
          <Toaster />
          <SidebarProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </SidebarProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
