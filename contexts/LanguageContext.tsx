"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pl' | 'de' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isClient: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  en: {
    // Navigation
    'nav.business_travel': 'Business Travel',
    'nav.statistics': 'Statistics',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.language': 'Language',
    
    // Main page
    'main.title': 'Business Travel',
    'main.subtitle': 'Track and manage your business travel expenses',
    'main.add_travel': 'Add Business Travel',
    'main.export_all': 'Export Business Travel',
    'main.export_all_desc': 'Export all business travel at once for accounting purposes',
    'main.export_selected': 'Export {count} selected business travel(s)',
    'main.export_all_pdfs': 'Export All PDFs',
    'main.export_all_csvs': 'Export All CSVs',
    'main.export_selected_pdfs': 'Export Selected PDFs ({count})',
    'main.export_selected_csvs': 'Export Selected CSVs ({count})',
    'main.clear_selection': 'Clear Selection',
    
    // Table headers
    'table.business_travel': 'Business Travel',
    'table.destination': 'Destination',
    'table.dates': 'Dates',
    'table.purpose': 'Purpose',
    'table.meals_allowance': 'Meals Allowance',
    'table.expenses': 'Expenses',
    'table.total': 'Total',
    'table.actions': 'Actions',
    
    // Settings
    'settings.title': 'User Settings',
    'settings.language': 'Language',
    'settings.language_desc': 'Select your preferred language',
    'settings.save': 'Save Settings',
    'settings.saved': 'Settings saved successfully',
    
    // Languages
    'lang.english': 'English',
    'lang.polish': 'Polski',
    'lang.german': 'Deutsch',
    'lang.french': 'Français',
  },
  pl: {
    // Navigation
    'nav.business_travel': 'Podróże Służbowe',
    'nav.statistics': 'Statystyki',
    'nav.settings': 'Ustawienia',
    'nav.logout': 'Wyloguj',
    'nav.language': 'Język',
    
    // Main page
    'main.title': 'Podróże Służbowe',
    'main.subtitle': 'Śledź i zarządzaj wydatkami z podróży służbowych',
    'main.add_travel': 'Dodaj Podróż Służbową',
    'main.export_all': 'Eksportuj Podróże Służbowe',
    'main.export_all_desc': 'Eksportuj wszystkie podróże służbowe na raz do celów księgowych',
    'main.export_selected': 'Eksportuj {count} wybranych podróży służbowych',
    'main.export_all_pdfs': 'Eksportuj Wszystkie PDF',
    'main.export_all_csvs': 'Eksportuj Wszystkie CSV',
    'main.export_selected_pdfs': 'Eksportuj Wybrane PDF ({count})',
    'main.export_selected_csvs': 'Eksportuj Wybrane CSV ({count})',
    'main.clear_selection': 'Wyczyść Zaznaczenie',
    
    // Table headers
    'table.business_travel': 'Podróż Służbowa',
    'table.destination': 'Miejsce Docelowe',
    'table.dates': 'Daty',
    'table.purpose': 'Cel',
    'table.meals_allowance': 'Dieta',
    'table.expenses': 'Wydatki',
    'table.total': 'Razem',
    'table.actions': 'Akcje',
    
    // Settings
    'settings.title': 'Ustawienia Użytkownika',
    'settings.language': 'Język',
    'settings.language_desc': 'Wybierz preferowany język',
    'settings.save': 'Zapisz Ustawienia',
    'settings.saved': 'Ustawienia zostały zapisane',
    
    // Languages
    'lang.english': 'English',
    'lang.polish': 'Polski',
    'lang.german': 'Deutsch',
    'lang.french': 'Français',
  },
  de: {
    // Navigation
    'nav.business_travel': 'Geschäftsreisen',
    'nav.statistics': 'Statistiken',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',
    'nav.language': 'Sprache',
    
    // Main page
    'main.title': 'Geschäftsreisen',
    'main.subtitle': 'Verfolgen und verwalten Sie Ihre Geschäftsreisekosten',
    'main.add_travel': 'Geschäftsreise Hinzufügen',
    'main.export_all': 'Geschäftsreisen Exportieren',
    'main.export_all_desc': 'Exportieren Sie alle Geschäftsreisen auf einmal für Buchhaltungszwecke',
    'main.export_selected': '{count} ausgewählte Geschäftsreisen exportieren',
    'main.export_all_pdfs': 'Alle PDFs Exportieren',
    'main.export_all_csvs': 'Alle CSVs Exportieren',
    'main.export_selected_pdfs': 'Ausgewählte PDFs Exportieren ({count})',
    'main.export_selected_csvs': 'Ausgewählte CSVs Exportieren ({count})',
    'main.clear_selection': 'Auswahl Löschen',
    
    // Table headers
    'table.business_travel': 'Geschäftsreise',
    'table.destination': 'Zielort',
    'table.dates': 'Daten',
    'table.purpose': 'Zweck',
    'table.meals_allowance': 'Tagesgeld',
    'table.expenses': 'Ausgaben',
    'table.total': 'Gesamt',
    'table.actions': 'Aktionen',
    
    // Settings
    'settings.title': 'Benutzereinstellungen',
    'settings.language': 'Sprache',
    'settings.language_desc': 'Wählen Sie Ihre bevorzugte Sprache',
    'settings.save': 'Einstellungen Speichern',
    'settings.saved': 'Einstellungen erfolgreich gespeichert',
    
    // Languages
    'lang.english': 'English',
    'lang.polish': 'Polski',
    'lang.german': 'Deutsch',
    'lang.french': 'Français',
  },
  fr: {
    // Navigation
    'nav.business_travel': 'Voyages d\'Affaires',
    'nav.statistics': 'Statistiques',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.language': 'Langue',
    
    // Main page
    'main.title': 'Voyages d\'Affaires',
    'main.subtitle': 'Suivez et gérez vos dépenses de voyage d\'affaires',
    'main.add_travel': 'Ajouter un Voyage d\'Affaires',
    'main.export_all': 'Exporter les Voyages d\'Affaires',
    'main.export_all_desc': 'Exporter tous les voyages d\'affaires en une fois à des fins comptables',
    'main.export_selected': 'Exporter {count} voyage(s) d\'affaires sélectionné(s)',
    'main.export_all_pdfs': 'Exporter Tous les PDFs',
    'main.export_all_csvs': 'Exporter Tous les CSVs',
    'main.export_selected_pdfs': 'Exporter les PDFs Sélectionnés ({count})',
    'main.export_selected_csvs': 'Exporter les CSVs Sélectionnés ({count})',
    'main.clear_selection': 'Effacer la Sélection',
    
    // Table headers
    'table.business_travel': 'Voyage d\'Affaires',
    'table.destination': 'Destination',
    'table.dates': 'Dates',
    'table.purpose': 'Objectif',
    'table.meals_allowance': 'Indemnité Repas',
    'table.expenses': 'Dépenses',
    'table.total': 'Total',
    'table.actions': 'Actions',
    
    // Settings
    'settings.title': 'Paramètres Utilisateur',
    'settings.language': 'Langue',
    'settings.language_desc': 'Sélectionnez votre langue préférée',
    'settings.save': 'Sauvegarder les Paramètres',
    'settings.saved': 'Paramètres sauvegardés avec succès',
    
    // Languages
    'lang.english': 'English',
    'lang.polish': 'Polski',
    'lang.german': 'Deutsch',
    'lang.french': 'Français',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'pl', 'de', 'fr'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    // Always try to get translation, fallback to key if not found
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Debug logging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`Translation for "${key}" in ${language}:`, value || 'NOT FOUND');
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isClient }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
