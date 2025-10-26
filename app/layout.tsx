import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import { ConversationProvider } from "@/contexts/ConversationContext";
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
        <ConversationProvider>
          <Layout>{children}</Layout>
        </ConversationProvider>
      </body>
    </html>
  );
}
