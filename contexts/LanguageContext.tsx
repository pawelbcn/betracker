"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pl' | 'de' | 'fr' | 'es';

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
    'lang.spanish': 'Español',

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
    'lang.spanish': 'Español',

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
    'lang.spanish': 'Español',

    // Delegation Form
    'form.business_travel_title': 'Geschäftsreise-Titel',
    'form.purpose': 'Zweck',
    'form.destination_city': 'Zielstadt',
    'form.destination_country': 'Zielland',
    'form.start_date': 'Startdatum',
    'form.start_time': 'Startzeit',
    'form.end_date': 'Enddatum',
    'form.end_time': 'Endzeit',
    'form.daily_allowance': 'Tagegeld',
    'form.exchange_rate': 'Wechselkurs',
    'form.notes': 'Notizen',
    'form.save': 'Speichern',
    'form.cancel': 'Abbrechen',
    'form.add_delegation': 'Geschäftsreise Hinzufügen',
    'form.edit_delegation': 'Geschäftsreise Bearbeiten',
    'form.required_field': 'Dieses Feld ist erforderlich',
    'form.invalid_date': 'Bitte geben Sie ein gültiges Datum ein',
    'form.invalid_time': 'Bitte geben Sie eine gültige Zeit ein',
    'form.invalid_number': 'Bitte geben Sie eine gültige Zahl ein',
    'form.success_added': 'Geschäftsreise erfolgreich hinzugefügt!',
    'form.success_updated': 'Geschäftsreise erfolgreich aktualisiert!',
    'form.error_adding': 'Fehler beim Hinzufügen der Geschäftsreise',
    'form.error_updating': 'Fehler beim Aktualisieren der Geschäftsreise',

    // Expense Form
    'expense.description': 'Beschreibung',
    'expense.amount': 'Betrag',
    'expense.currency': 'Währung',
    'expense.category': 'Kategorie',
    'expense.date': 'Datum',
    'expense.receipt': 'Beleg',
    'expense.add_expense': 'Ausgabe Hinzufügen',
    'expense.edit_expense': 'Ausgabe Bearbeiten',
    'expense.categories.transport': 'Transport',
    'expense.categories.accommodation': 'Unterkunft',
    'expense.categories.meals': 'Mahlzeiten',
    'expense.categories.other': 'Sonstiges',

    // Statistics
    'stats.title': 'Statistiken',
    'stats.subtitle': 'Überblick über Ihre Geschäftsreisekosten',
    'stats.total_delegations': 'Gesamte Reisen',
    'stats.total_expenses': 'Gesamtausgaben',
    'stats.average_daily': 'Durchschnittliches Tagegeld',
    'stats.most_expensive': 'Teuerste Reise',
    'expense.stats.by_category': 'Ausgaben nach Kategorie',
    'expense.stats.by_month': 'Ausgaben nach Monat',
    'expense.stats.by_country': 'Ausgaben nach Land',
    'expense.stats.no_data': 'Keine Daten verfügbar',
    'stats.view': 'Ansicht',
    'stats.this_month': 'Dieser Monat',
    'stats.this_year': 'Dieses Jahr',
    'stats.business_travel': 'Geschäftsreisen',
    'stats.expenses': 'Ausgaben',
    'stats.meals_allowance': 'Tagegeld',
    'stats.total': 'Gesamt',
    'stats.monthly_overview': 'Monatlicher Überblick (2025)',
    'stats.yearly_overview': 'Jährlicher Überblick (Letzte 3 Jahre)',
    'stats.by_country': 'Geschäftsreisen nach Land',
    'stats.by_category': 'Ausgaben nach Kategorie',
    'stats.delegations': 'Reisen',
    'stats.count': 'Anzahl',
    'stats.amount': 'Betrag',

    // Delegation Detail Page
    'delegation.loading': 'Geschäftsreise wird geladen...',
    'delegation.back_to_travel': 'Zurück zu Geschäftsreisen',
    'delegation.edit_delegation': 'Geschäftsreise bearbeiten',
    'delegation.delete_delegation': 'Geschäftsreise löschen',
    'delegation.expense_details': 'Ausgabendetails',
    'delegation.add_expense': 'Ausgabe hinzufügen',
    'delegation.edit_expense': 'Ausgabe bearbeiten',
    'delegation.delete_expense': 'Ausgabe löschen',
    'delegation.confirm_delete': 'Sind Sie sicher, dass Sie diese Geschäftsreise löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    'delegation.confirm_delete_expense': 'Sind Sie sicher, dass Sie diese Ausgabe löschen möchten?',
    'delegation.delete_failed': 'Geschäftsreise konnte nicht gelöscht werden',
    'delegation.delete_expense_failed': 'Ausgabe konnte nicht gelöscht werden',
    'delegation.delete_error': 'Fehler beim Löschen der Geschäftsreise',
    'delegation.delete_expense_error': 'Fehler beim Löschen der Ausgabe',

    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.confirm': 'Bestätigen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Anzeigen',
    'common.close': 'Schließen',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
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
    'lang.spanish': 'Español',

    // Delegation Form
    'form.business_travel_title': 'Titre du Voyage d\'Affaires',
    'form.purpose': 'Objectif',
    'form.destination_city': 'Ville de Destination',
    'form.destination_country': 'Pays de Destination',
    'form.start_date': 'Date de Début',
    'form.start_time': 'Heure de Début',
    'form.end_date': 'Date de Fin',
    'form.end_time': 'Heure de Fin',
    'form.daily_allowance': 'Indemnité Quotidienne',
    'form.exchange_rate': 'Taux de Change',
    'form.notes': 'Notes',
    'form.save': 'Enregistrer',
    'form.cancel': 'Annuler',
    'form.add_delegation': 'Ajouter un Voyage d\'Affaires',
    'form.edit_delegation': 'Modifier le Voyage d\'Affaires',
    'form.required_field': 'Ce champ est obligatoire',
    'form.invalid_date': 'Veuillez entrer une date valide',
    'form.invalid_time': 'Veuillez entrer une heure valide',
    'form.invalid_number': 'Veuillez entrer un nombre valide',
    'form.success_added': 'Voyage d\'affaires ajouté avec succès !',
    'form.success_updated': 'Voyage d\'affaires mis à jour avec succès !',
    'form.error_adding': 'Erreur lors de l\'ajout du voyage d\'affaires',
    'form.error_updating': 'Erreur lors de la mise à jour du voyage d\'affaires',

    // Expense Form
    'expense.description': 'Description',
    'expense.amount': 'Montant',
    'expense.currency': 'Devise',
    'expense.category': 'Catégorie',
    'expense.date': 'Date',
    'expense.receipt': 'Reçu',
    'expense.add_expense': 'Ajouter une Dépense',
    'expense.edit_expense': 'Modifier la Dépense',
    'expense.categories.transport': 'Transport',
    'expense.categories.accommodation': 'Hébergement',
    'expense.categories.meals': 'Repas',
    'expense.categories.other': 'Autre',

    // Statistics
    'stats.title': 'Statistiques',
    'stats.subtitle': 'Aperçu de vos dépenses de voyage d\'affaires',
    'stats.total_delegations': 'Total des Voyages',
    'stats.total_expenses': 'Total des Dépenses',
    'stats.average_daily': 'Indemnité Quotidienne Moyenne',
    'stats.most_expensive': 'Voyage le Plus Cher',
    'expense.stats.by_category': 'Dépenses par Catégorie',
    'expense.stats.by_month': 'Dépenses par Mois',
    'expense.stats.by_country': 'Dépenses par Pays',
    'expense.stats.no_data': 'Aucune donnée disponible',
    'stats.view': 'Vue',
    'stats.this_month': 'Ce Mois',
    'stats.this_year': 'Cette Année',
    'stats.business_travel': 'Voyages d\'Affaires',
    'stats.expenses': 'Dépenses',
    'stats.meals_allowance': 'Indemnité Repas',
    'stats.total': 'Total',
    'stats.monthly_overview': 'Aperçu Mensuel (2025)',
    'stats.yearly_overview': 'Aperçu Annuel (3 Dernières Années)',
    'stats.by_country': 'Voyages d\'Affaires par Pays',
    'stats.by_category': 'Dépenses par Catégorie',
    'stats.delegations': 'voyages',
    'stats.count': 'Nombre',
    'stats.amount': 'Montant',

    // Delegation Detail Page
    'delegation.loading': 'Chargement du voyage d\'affaires...',
    'delegation.back_to_travel': 'Retour aux Voyages d\'Affaires',
    'delegation.edit_delegation': 'Modifier le voyage d\'affaires',
    'delegation.delete_delegation': 'Supprimer le voyage d\'affaires',
    'delegation.expense_details': 'Détails des Dépenses',
    'delegation.add_expense': 'Ajouter une Dépense',
    'delegation.edit_expense': 'Modifier la dépense',
    'delegation.delete_expense': 'Supprimer la dépense',
    'delegation.confirm_delete': 'Êtes-vous sûr de vouloir supprimer ce voyage d\'affaires ? Cette action ne peut pas être annulée.',
    'delegation.confirm_delete_expense': 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
    'delegation.delete_failed': 'Échec de la suppression du voyage d\'affaires',
    'delegation.delete_expense_failed': 'Échec de la suppression de la dépense',
    'delegation.delete_error': 'Erreur lors de la suppression du voyage d\'affaires',
    'delegation.delete_expense_error': 'Erreur lors de la suppression de la dépense',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
  },
  es: {
    // Navigation
    'nav.business_travel': 'Viajes de Negocios',
    'nav.statistics': 'Estadísticas',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',
    'nav.language': 'Idioma',
    
    // Main page
    'main.title': 'Viajes de Negocios',
    'main.subtitle': 'Rastrea y gestiona tus gastos de viajes de negocios',
    'main.add_travel': 'Agregar Viaje de Negocios',
    'main.export_all': 'Exportar Viajes de Negocios',
    'main.export_all_desc': 'Exporta todos los viajes de negocios de una vez para propósitos contables',
    'main.export_selected': 'Exportar {count} viaje(s) de negocios seleccionado(s)',
    'main.export_all_pdfs': 'Exportar Todos los PDFs',
    'main.export_all_csvs': 'Exportar Todos los CSVs',
    'main.export_selected_pdfs': 'Exportar PDFs Seleccionados ({count})',
    'main.export_selected_csvs': 'Exportar CSVs Seleccionados ({count})',
    'main.clear_selection': 'Limpiar Selección',
    
    // Table headers
    'table.business_travel': 'Viaje de Negocios',
    'table.destination': 'Destino',
    'table.dates': 'Fechas',
    'table.purpose': 'Propósito',
    'table.meals_allowance': 'Dieta',
    'table.expenses': 'Gastos',
    'table.total': 'Total',
    'table.actions': 'Acciones',
    
    // Settings
    'settings.title': 'Configuración de Usuario',
    'settings.language': 'Idioma',
    'settings.language_desc': 'Selecciona tu idioma preferido',
    'settings.save': 'Guardar Configuración',
    'settings.saved': 'Configuración guardada exitosamente',
    
    // Languages
    'lang.english': 'English',
    'lang.polish': 'Polski',
    'lang.german': 'Deutsch',
    'lang.french': 'Français',
    'lang.spanish': 'Español',

    // Delegation Form
    'form.business_travel_title': 'Título del Viaje de Negocios',
    'form.purpose': 'Propósito',
    'form.destination_city': 'Ciudad de Destino',
    'form.destination_country': 'País de Destino',
    'form.start_date': 'Fecha de Inicio',
    'form.start_time': 'Hora de Inicio',
    'form.end_date': 'Fecha de Fin',
    'form.end_time': 'Hora de Fin',
    'form.daily_allowance': 'Dieta Diaria',
    'form.exchange_rate': 'Tipo de Cambio',
    'form.notes': 'Notas',
    'form.save': 'Guardar',
    'form.cancel': 'Cancelar',
    'form.add_delegation': 'Agregar Viaje de Negocios',
    'form.edit_delegation': 'Editar Viaje de Negocios',
    'form.required_field': 'Este campo es obligatorio',
    'form.invalid_date': 'Por favor ingresa una fecha válida',
    'form.invalid_time': 'Por favor ingresa una hora válida',
    'form.invalid_number': 'Por favor ingresa un número válido',
    'form.success_added': '¡Viaje de negocios agregado exitosamente!',
    'form.success_updated': '¡Viaje de negocios actualizado exitosamente!',
    'form.error_adding': 'Error al agregar viaje de negocios',
    'form.error_updating': 'Error al actualizar viaje de negocios',

    // Expense Form
    'expense.description': 'Descripción',
    'expense.amount': 'Cantidad',
    'expense.currency': 'Moneda',
    'expense.category': 'Categoría',
    'expense.date': 'Fecha',
    'expense.receipt': 'Recibo',
    'expense.add_expense': 'Agregar Gasto',
    'expense.edit_expense': 'Editar Gasto',
    'expense.categories.transport': 'Transporte',
    'expense.categories.accommodation': 'Alojamiento',
    'expense.categories.meals': 'Comidas',
    'expense.categories.other': 'Otro',

    // Statistics
    'stats.title': 'Estadísticas',
    'stats.subtitle': 'Resumen de tus gastos de viajes de negocios',
    'stats.total_delegations': 'Total de Viajes',
    'stats.total_expenses': 'Total de Gastos',
    'stats.average_daily': 'Dieta Diaria Promedio',
    'stats.most_expensive': 'Viaje Más Costoso',
    'expense.stats.by_category': 'Gastos por Categoría',
    'expense.stats.by_month': 'Gastos por Mes',
    'expense.stats.by_country': 'Gastos por País',
    'expense.stats.no_data': 'No hay datos disponibles',
    'stats.view': 'Vista',
    'stats.this_month': 'Este Mes',
    'stats.this_year': 'Este Año',
    'stats.business_travel': 'Viajes de Negocios',
    'stats.expenses': 'Gastos',
    'stats.meals_allowance': 'Dieta',
    'stats.total': 'Total',
    'stats.monthly_overview': 'Resumen Mensual (2025)',
    'stats.yearly_overview': 'Resumen Anual (Últimos 3 Años)',
    'stats.by_country': 'Viajes de Negocios por País',
    'stats.by_category': 'Gastos por Categoría',
    'stats.delegations': 'viajes',
    'stats.count': 'Cantidad',
    'stats.amount': 'Cantidad',

    // Delegation Detail Page
    'delegation.loading': 'Cargando viaje de negocios...',
    'delegation.back_to_travel': 'Volver a Viajes de Negocios',
    'delegation.edit_delegation': 'Editar viaje de negocios',
    'delegation.delete_delegation': 'Eliminar viaje de negocios',
    'delegation.expense_details': 'Detalles de Gastos',
    'delegation.add_expense': 'Agregar Gasto',
    'delegation.edit_expense': 'Editar gasto',
    'delegation.delete_expense': 'Eliminar gasto',
    'delegation.confirm_delete': '¿Estás seguro de que quieres eliminar este viaje de negocios? Esta acción no se puede deshacer.',
    'delegation.confirm_delete_expense': '¿Estás seguro de que quieres eliminar este gasto?',
    'delegation.delete_failed': 'Error al eliminar el viaje de negocios',
    'delegation.delete_expense_failed': 'Error al eliminar el gasto',
    'delegation.delete_error': 'Error al eliminar el viaje de negocios',
    'delegation.delete_expense_error': 'Error al eliminar el gasto',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.confirm': 'Confirmar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
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
      if (savedLanguage && ['en', 'pl', 'de', 'fr', 'es'].includes(savedLanguage)) {
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
