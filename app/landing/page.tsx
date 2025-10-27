"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Calculator, 
  Plane, 
  Globe, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Users,
  TrendingUp,
  FileText,
  Clock,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Calculator,
      title: "Kalkulator Delegacji Zagranicznej 2024",
      description: "Automatyczne obliczanie diet i kosztów podróży służbowych zgodnie z polskim prawem podatkowym",
      benefits: ["Obliczanie diet według czasu delegacji", "Wsparcie dla wszystkich walut", "Zgodność z przepisami podatkowymi"]
    },
    {
      icon: Globe,
      title: "Kursy Walut NBP",
      description: "Integracja z Narodowym Bankiem Polskim dla aktualnych kursów walut",
      benefits: ["Aktualne kursy walut", "Automatyczne przeliczanie", "Historia kursów"]
    },
    {
      icon: FileText,
      title: "Rozliczenie Podróży Służbowej",
      description: "Kompletne narzędzie do rozliczania delegacji krajowych i zagranicznych",
      benefits: ["Eksport do PDF i CSV", "Szczegółowe raporty", "Archiwizacja dokumentów"]
    }
  ];

  const stats = [
    { number: "1000+", label: "Użytkowników" },
    { number: "50k+", label: "Rozliczonych delegacji" },
    { number: "99%", label: "Zadowolonych klientów" },
    { number: "24/7", label: "Dostępność" }
  ];

  const testimonials = [
    {
      name: "Anna Kowalska",
      company: "ABC Sp. z o.o.",
      text: "Doskonałe narzędzie do rozliczania delegacji. Oszczędza mi godziny pracy każdego miesiąca!",
      rating: 5
    },
    {
      name: "Piotr Nowak",
      company: "XYZ S.A.",
      text: "Najlepszy kalkulator delegacji zagranicznej jaki znalazłem. Polecam wszystkim księgowym.",
      rating: 5
    },
    {
      name: "Maria Wiśniewska",
      company: "DEF Sp. z o.o.",
      text: "Prosty w użyciu, ale bardzo funkcjonalny. Idealny dla małych i średnich firm.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Kalkulator Delegacji Zagranicznej
              <span className="block text-blue-600">2024</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Profesjonalne narzędzie do rozliczania podróży służbowych zgodnie z polskim prawem podatkowym. 
              Obliczaj diety, koszty delegacji i eksportuj raporty w kilka kliknięć.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rozpocznij za darmo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Zaloguj się
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dlaczego wybrać nasz kalkulator delegacji?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kompleksowe rozwiązanie dla firm, które potrzebują profesjonalnego narzędzia do rozliczania podróży służbowych
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-gray-600">
              Rozpocznij korzystanie z kalkulatora w 3 prostych krokach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Utwórz konto
              </h3>
              <p className="text-gray-600">
                Zarejestruj się za darmo i uzyskaj dostęp do wszystkich funkcji kalkulatora
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Dodaj delegację
              </h3>
              <p className="text-gray-600">
                Wprowadź dane podróży służbowej - kraj, daty, cel i koszty
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Pobierz raport
              </h3>
              <p className="text-gray-600">
                Eksportuj szczegółowy raport do PDF lub CSV dla celów księgowych
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Co mówią nasi użytkownicy
            </h2>
            <p className="text-xl text-gray-600">
              Dołącz do tysięcy zadowolonych użytkowników
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gotowy na uproszczenie rozliczania delegacji?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Dołącz do tysięcy firm, które już korzystają z naszego kalkulatora delegacji zagranicznej
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Rozpocznij za darmo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kalkulator Delegacji</h3>
              <p className="text-gray-400">
                Profesjonalne narzędzie do rozliczania podróży służbowych zgodnie z polskim prawem podatkowym.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Funkcje</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Kalkulator diet</li>
                <li>Kursy walut NBP</li>
                <li>Eksport raportów</li>
                <li>Archiwizacja</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Wsparcie</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Centrum pomocy</li>
                <li>Kontakt</li>
                <li>FAQ</li>
                <li>Dokumentacja</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <p className="text-gray-400">
                Email: kontakt@kalkulator-delegacji.pl<br />
                Telefon: +48 123 456 789
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kalkulator Delegacji. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
