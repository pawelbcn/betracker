"use client";
import { FileText, Home, BarChart3, Plane, Menu, X, LogOut, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authenticated');
      sessionStorage.removeItem('username');
    }
    router.push('/login');
  };

        const navigation = [
          { name: t('nav.business_travel'), href: "/", icon: Plane },
          { name: t('nav.statistics'), href: "/stats", icon: BarChart3 },
          { name: t('nav.exchange_rates'), href: "/exchange-rates", icon: TrendingUp },
          { name: t('nav.settings'), href: "/settings", icon: Settings },
        ];

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-neutral-900">Business Travel Tracker</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-neutral-100 text-neutral-900 font-medium"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="w-6 h-6" />
{t('nav.logout')}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-20 bg-white border-r border-neutral-200 shadow-sm p-4 hidden md:block">
        <div className="flex items-center justify-center mb-8">
          <Link href="/landing" className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold text-neutral-900 hidden lg:block">Kalkulator Delegacji</span>
          </Link>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-center p-2 transition-colors ${
                  pathname === item.href
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
                title={item.name}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
          
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
title={t('nav.logout')}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-neutral-900">Kalkulator Delegacji</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 md:px-4 py-4 md:py-6">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}