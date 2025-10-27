"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pl';

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
          'nav.exchange_rates': 'Exchange Rates',
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

    // Delegation Form
    'form.business_travel_title': 'Business Travel Title',
    'form.purpose': 'Purpose',
    'form.destination_city': 'Destination City',
    'form.destination_country': 'Destination Country',
    'form.start_date': 'Start Date',
    'form.start_time': 'Start Time',
    'form.end_date': 'End Date',
    'form.end_time': 'End Time',
    'form.daily_allowance': 'Daily Allowance',
    'form.exchange_rate': 'Exchange Rate',
    'form.notes': 'Notes',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.add_delegation': 'Add Business Travel',
    'form.edit_delegation': 'Edit Business Travel',
    'form.required_field': 'This field is required',
    'form.invalid_date': 'Please enter a valid date',
    'form.invalid_time': 'Please enter a valid time',
    'form.invalid_number': 'Please enter a valid number',
    'form.success_added': 'Business travel added successfully!',
    'form.success_updated': 'Business travel updated successfully!',
    'form.error_adding': 'Error adding business travel',
    'form.error_updating': 'Error updating business travel',

    // Expense Form
    'expense.description': 'Description',
    'expense.amount': 'Amount',
    'expense.currency': 'Currency',
    'expense.category': 'Category',
    'expense.date': 'Date',
    'expense.receipt': 'Receipt',
    'expense.add_expense': 'Add Expense',
    'expense.edit_expense': 'Edit Expense',
    'expense.categories.transport': 'Transport',
    'expense.categories.accommodation': 'Accommodation',
    'expense.categories.meals': 'Meals',
    'expense.categories.other': 'Other',

    // Statistics
    'stats.title': 'Statistics',
    'stats.subtitle': 'Overview of your business travel expenses',
    'stats.total_delegations': 'Total Delegations',
    'stats.total_expenses': 'Total Expenses',
    'stats.average_daily': 'Average Daily Allowance',
    'stats.most_expensive': 'Most Expensive Delegation',
    'expense.stats.by_category': 'Expenses by Category',
    'expense.stats.by_month': 'Expenses by Month',
    'expense.stats.by_country': 'Expenses by Country',
    'expense.stats.no_data': 'No data available',
    'stats.view': 'View',
    'stats.this_month': 'This Month',
    'stats.this_year': 'This Year',
    'stats.business_travel': 'Business Travel',
    'stats.expenses': 'Expenses',
    'stats.meals_allowance': 'Meals Allowance',
    'stats.total': 'Total',
    'stats.monthly_overview': 'Monthly Overview (2025)',
    'stats.yearly_overview': 'Yearly Overview (Last 3 Years)',
    'stats.by_country': 'Business Travel by Country',
    'stats.by_category': 'Expenses by Category',
    'stats.delegations': 'delegations',
    'stats.count': 'Count',
    'stats.amount': 'Amount',

    // Delegation Detail Page
    'delegation.loading': 'Loading delegation...',
    'delegation.back_to_travel': 'Back to Business Travel',
    'delegation.edit_delegation': 'Edit delegation',
    'delegation.delete_delegation': 'Delete delegation',
    'delegation.expense_details': 'Expense Details',
    'delegation.add_expense': 'Add Expense',
    'delegation.edit_expense': 'Edit expense',
    'delegation.delete_expense': 'Delete expense',
    'delegation.confirm_delete': 'Are you sure you want to delete this delegation? This action cannot be undone.',
    'delegation.confirm_delete_expense': 'Are you sure you want to delete this expense?',
    'delegation.delete_failed': 'Failed to delete delegation',
    'delegation.delete_expense_failed': 'Failed to delete expense',
    'delegation.delete_error': 'Error deleting delegation',
    'delegation.delete_expense_error': 'Error deleting expense',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.save': 'Save',
    'common.cancel': 'Cancel',

    // Exchange Rates
    'exchange.title': 'Exchange Rates',
    'exchange.subtitle': 'Current and historical exchange rates from NBP (National Bank of Poland)',
    'exchange.date': 'Date:',
    'exchange.search_placeholder': 'Search currencies...',
    'exchange.refresh': 'Refresh',
    'exchange.loading': 'Loading exchange rates...',
    'exchange.rates_for': 'Exchange Rates for',
    'exchange.currency': 'Currency',
    'exchange.code': 'Code',
    'exchange.rate_pln': 'Exchange Rate (PLN)',
    'exchange.pln_per_unit': 'PLN per Unit',
    'exchange.no_results': 'No currencies found matching your search.',
    'exchange.no_data': 'No exchange rates available for this date.',
    'exchange.data_source': 'Data Source: National Bank of Poland (NBP)',
    'exchange.data_description': 'Exchange rates are updated daily and represent the average exchange rates (Table A) published by the National Bank of Poland. Rates are expressed as PLN per foreign currency unit.',
  },
    pl: {
      // Navigation
      'nav.business_travel': 'Podróże Służbowe',
      'nav.statistics': 'Statystyki',
      'nav.exchange_rates': 'Kursy Walut',
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

    // Delegation Form
    'form.business_travel_title': 'Tytuł Podróży Służbowej',
    'form.purpose': 'Cel',
    'form.destination_city': 'Miasto Docelowe',
    'form.destination_country': 'Kraj Docelowy',
    'form.start_date': 'Data Rozpoczęcia',
    'form.start_time': 'Godzina Rozpoczęcia',
    'form.end_date': 'Data Zakończenia',
    'form.end_time': 'Godzina Zakończenia',
    'form.daily_allowance': 'Dieta Dzienna',
    'form.exchange_rate': 'Kurs Wymiany',
    'form.notes': 'Notatki',
    'form.save': 'Zapisz',
    'form.cancel': 'Anuluj',
    'form.add_delegation': 'Dodaj Podróż Służbową',
    'form.edit_delegation': 'Edytuj Podróż Służbową',
    'form.required_field': 'To pole jest wymagane',
    'form.invalid_date': 'Proszę podać prawidłową datę',
    'form.invalid_time': 'Proszę podać prawidłową godzinę',
    'form.invalid_number': 'Proszę podać prawidłową liczbę',
    'form.success_added': 'Podróż służbowa została dodana pomyślnie!',
    'form.success_updated': 'Podróż służbowa została zaktualizowana pomyślnie!',
    'form.error_adding': 'Błąd podczas dodawania podróży służbowej',
    'form.error_updating': 'Błąd podczas aktualizowania podróży służbowej',

    // Expense Form
    'expense.description': 'Opis',
    'expense.amount': 'Kwota',
    'expense.currency': 'Waluta',
    'expense.category': 'Kategoria',
    'expense.date': 'Data',
    'expense.receipt': 'Paragon',
    'expense.add_expense': 'Dodaj Wydatek',
    'expense.edit_expense': 'Edytuj Wydatek',
    'expense.categories.transport': 'Transport',
    'expense.categories.accommodation': 'Zakwaterowanie',
    'expense.categories.meals': 'Posiłki',
    'expense.categories.other': 'Inne',

    // Statistics
    'stats.title': 'Statystyki',
    'stats.subtitle': 'Przegląd wydatków z podróży służbowych',
    'stats.total_delegations': 'Łączna Liczba Podróży',
    'stats.total_expenses': 'Łączne Wydatki',
    'stats.average_daily': 'Średnia Dieta Dzienna',
    'stats.most_expensive': 'Najdroższa Podróż',
    'expense.stats.by_category': 'Wydatki według Kategorii',
    'expense.stats.by_month': 'Wydatki według Miesiąca',
    'expense.stats.by_country': 'Wydatki według Kraju',
    'expense.stats.no_data': 'Brak dostępnych danych',
    'stats.view': 'Widok',
    'stats.this_month': 'Ten Miesiąc',
    'stats.this_year': 'Ten Rok',
    'stats.business_travel': 'Podróże Służbowe',
    'stats.expenses': 'Wydatki',
    'stats.meals_allowance': 'Dieta',
    'stats.total': 'Razem',
    'stats.monthly_overview': 'Przegląd Miesięczny (2025)',
    'stats.yearly_overview': 'Przegląd Roczny (Ostatnie 3 Lata)',
    'stats.by_country': 'Podróże Służbowe według Kraju',
    'stats.by_category': 'Wydatki według Kategorii',
    'stats.delegations': 'podróże',
    'stats.count': 'Liczba',
    'stats.amount': 'Kwota',

    // Delegation Detail Page
    'delegation.loading': 'Ładowanie podróży służbowej...',
    'delegation.back_to_travel': 'Powrót do Podróży Służbowych',
    'delegation.edit_delegation': 'Edytuj podróż służbową',
    'delegation.delete_delegation': 'Usuń podróż służbową',
    'delegation.expense_details': 'Szczegóły Wydatków',
    'delegation.add_expense': 'Dodaj Wydatek',
    'delegation.edit_expense': 'Edytuj wydatek',
    'delegation.delete_expense': 'Usuń wydatek',
    'delegation.confirm_delete': 'Czy na pewno chcesz usunąć tę podróż służbową? Ta operacja nie może zostać cofnięta.',
    'delegation.confirm_delete_expense': 'Czy na pewno chcesz usunąć ten wydatek?',
    'delegation.delete_failed': 'Nie udało się usunąć podróży służbowej',
    'delegation.delete_expense_failed': 'Nie udało się usunąć wydatku',
    'delegation.delete_error': 'Błąd podczas usuwania podróży służbowej',
    'delegation.delete_expense_error': 'Błąd podczas usuwania wydatku',

    // Common
    'common.loading': 'Ładowanie...',
    'common.error': 'Błąd',
    'common.success': 'Sukces',
    'common.confirm': 'Potwierdź',
    'common.delete': 'Usuń',
    'common.edit': 'Edytuj',
    'common.view': 'Zobacz',
    'common.close': 'Zamknij',
    'common.yes': 'Tak',
    'common.no': 'Nie',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',

    // Exchange Rates
    'exchange.title': 'Kursy Walut',
    'exchange.subtitle': 'Aktualne i historyczne kursy walut z NBP (Narodowy Bank Polski)',
    'exchange.date': 'Data:',
    'exchange.search_placeholder': 'Szukaj walut...',
    'exchange.refresh': 'Odśwież',
    'exchange.loading': 'Ładowanie kursów walut...',
    'exchange.rates_for': 'Kursy Walut dla',
    'exchange.currency': 'Waluta',
    'exchange.code': 'Kod',
    'exchange.rate_pln': 'Kurs Wymiany (PLN)',
    'exchange.pln_per_unit': 'PLN za Jednostkę',
    'exchange.no_results': 'Nie znaleziono walut pasujących do wyszukiwania.',
    'exchange.no_data': 'Brak kursów walut dostępnych dla tej daty.',
    'exchange.data_source': 'Źródło Danych: Narodowy Bank Polski (NBP)',
    'exchange.data_description': 'Kursy walut są aktualizowane codziennie i reprezentują średnie kursy wymiany (Tabela A) publikowane przez Narodowy Bank Polski. Kursy wyrażone są jako PLN za jednostkę waluty obcej.',
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
      if (savedLanguage && ['en', 'pl'].includes(savedLanguage)) {
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
    // Get the translation directly from the flat structure
    const translation = (translations[language] as any)?.[key];
    
    // If we found a translation, return it
    if (translation) {
      return translation;
    }
    
    // Fallback to English if translation not found
    const englishTranslation = (translations.en as any)?.[key];
    
    // Return English fallback or the key itself
    return englishTranslation || key;
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
