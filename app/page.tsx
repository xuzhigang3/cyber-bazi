"use client";

import React, { useState, useEffect, Suspense } from 'react';
import BaziForm from './components/BaziForm';
import BaziResult from './components/BaziResult';
import { generateBaziReport, getFullReport, BaziInput, BaziResult as IBaziResult } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Globe, AlertCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IBaziResult | null>(null);
  const [inputData, setInputData] = useState<BaziInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    document.title = t('appTitle') + ' - ' + t('appSubtitle');
  }, [t]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (searchParams.get('success') && orderId) {
      setIsLoading(true);
      getFullReport(orderId)
        .then(data => {
          setResult(data.result);
          setInputData(data.input);
          router.replace('/');
        })
        .catch(err => {
          console.error(err);
          setError(t('fetchReportFailed'));
        })
        .finally(() => setIsLoading(false));
    } else if (searchParams.get('canceled')) {
      setError(t('paymentCanceled'));
      router.replace('/');
    }
  }, [searchParams, router, t]);

  const handleSubmit = async (data: BaziInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateBaziReport({ ...data, language });
      setInputData(data);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(t('generateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-fuchsia-100 text-theme-text font-sans selection:bg-theme-accent/30">
      {/* Background Effects - Light Purple Radial */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.05)_0%,transparent_70%)]" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-theme-border text-theme-text hover:bg-theme-text hover:text-theme-bg transition-all text-xs uppercase tracking-widest font-serif"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === 'zh' ? 'EN' : '中'}
        </button>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-16 md:py-24 min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
            >
              <BaziForm onSubmit={handleSubmit} isLoading={isLoading} initialData={inputData} />
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="p-4 border border-red-900/20 bg-red-50 text-red-900 text-sm flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed font-serif">
                        {error}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl"
            >
              <BaziResult result={result} input={inputData!} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-theme-muted text-xs space-y-3 border-t border-theme-border mt-auto w-full font-serif tracking-wide">
        <p className="max-w-md mx-auto px-4">{t('disclaimer')}</p>
        <p className="uppercase tracking-widest">{t('copyright').replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-purple-50 flex items-center justify-center text-purple-900">Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
