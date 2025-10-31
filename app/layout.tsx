import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Layout from "@/components/Layout";
import AuthWrapper from "@/components/AuthWrapper";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Delegation Expense Tracker",
  description: "Track your business travel expenses and daily allowances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthWrapper>
            <ConversationProvider>
              <Layout>{children}</Layout>
            </ConversationProvider>
          </AuthWrapper>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
