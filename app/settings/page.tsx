"use client";
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Save } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t, isClient } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<typeof language>(language);
  const [showSaved, setShowSaved] = useState(false);


  const languages = [
    { code: 'en' as const, name: t('lang.english'), flag: '🇺🇸' },
    { code: 'pl' as const, name: t('lang.polish'), flag: '🇵🇱' },
    { code: 'de' as const, name: t('lang.german'), flag: '🇩🇪' },
    { code: 'fr' as const, name: t('lang.french'), flag: '🇫🇷' },
  ];

  const handleSave = () => {
    setLanguage(selectedLanguage);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          {t('settings.title')}
        </h1>

        {/* Language Selection */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              {t('settings.language')}
            </h2>
            <p className="text-neutral-600 mb-4">
              {t('settings.language_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-neutral-500 uppercase">{lang.code}</div>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('settings.save')}
          </button>

          {showSaved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
              <Check className="w-4 h-4" />
              {t('settings.saved')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
