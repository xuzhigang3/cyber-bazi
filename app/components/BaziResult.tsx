"use client";

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { BaziResult as IBaziResult, BaziInput, checkout } from '../services/geminiService';
import { ArrowLeft, Sparkles, Download, Lock, CreditCard, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import AdUnit from './AdUnit';

interface Props {
  result: IBaziResult;
  input: BaziInput;
  onReset: () => void;
}

export default function BaziResult({ result, input, onReset }: Props) {
  const { t, language } = useLanguage();
  const { bazi, summary, report, teaser, id } = result;
  const isUnlocked = !!report;
  const [isPaying, setIsPaying] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const handlePayment = async () => {
    if (!id) return;
    setIsPaying(true);
    try {
      const { url } = await checkout(id, input.email) as { url: string };
      setCheckoutUrl(url);
      setShowQR(true);
    } catch (error: any) {
      console.error(error);
      alert(t('generateFailed'));
    } finally {
      setIsPaying(false);
    }
  };

  // Polling for payment status when QR is shown
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQR && !isUnlocked) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/report/${id}`);
          if (res.ok) {
            // Payment success! Refresh page or update state
            window.location.reload();
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showQR, isUnlocked, id]);

  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-theme-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-theme-card border border-theme-border rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-1 bg-theme-accent mx-auto rounded-full mb-8"></div>
                <h3 className="text-xl font-serif text-theme-text tracking-wide">{t('qrTitle')}</h3>

                <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-inner border-4 border-white">
                  <QRCodeSVG value={checkoutUrl} size={200} level="H" />
                </div>

                <p className="text-theme-muted text-sm font-serif leading-relaxed px-2">
                  {t('qrDesc')}
                </p>

                <div className="pt-4 space-y-3">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-theme-accent hover:bg-theme-accent/90 text-theme-bg font-serif tracking-widest uppercase py-4 rounded-full transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {t('qrDirectLink')}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setShowQR(false)}
                    className="w-full border border-theme-border text-theme-muted hover:text-theme-text font-serif tracking-widest uppercase py-3 rounded-full transition-all text-xs"
                  >
                    {t('qrClose')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-theme-muted hover:text-theme-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif tracking-[0.2em] text-xs uppercase">{t('resetBtn')}</span>
        </button>
        <div className="text-theme-accent font-serif tracking-[0.2em] text-xs uppercase flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {t('resultTitle')}
        </div>
      </div>

      {/* User Info & Bazi Grid */}
      <div className="bg-theme-card backdrop-blur-md border border-theme-border rounded-3xl p-8 md:p-12 mb-8">
        <div className="text-center mb-12 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-8 bg-theme-border -mt-12"></div>
          <h2 className="text-3xl font-serif text-theme-text mb-4 font-light tracking-wide">
            {input.name ? `${input.name}${t('baziGridTitle')}` : (language === 'en' ? 'Innate Rhythm Chart' : `命主${t('baziGridTitle')}`)}
          </h2>
          <p className="text-theme-muted text-xs tracking-[0.2em] uppercase mb-3 font-serif">
            {input.gender === 'male' ? t('genderMale') : t('genderFemale')} {t('baziGridSubtitle')} {input.date} {input.time} {t('baziGridSubtitle')} {input.location}
          </p>
          <p className="text-theme-accent text-xs tracking-[0.1em] font-serif italic">
            {isUnlocked ? `${t('reportSent')} ${input.email}` : `${t('reportWillSend')} ${input.email}`}
          </p>
        </div>

        {/* Bazi Pillars */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-lg mx-auto mb-12">
          {[
            { label: t('hourPillar'), value: bazi.hour },
            { label: t('dayPillar'), value: bazi.day },
            { label: t('monthPillar'), value: bazi.month },
            { label: t('yearPillar'), value: bazi.year },
          ].map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-theme-muted text-xs tracking-[0.3em] uppercase mb-6 font-serif">{pillar.label}</span>
              <div className="flex flex-col items-center justify-center w-16 h-32 border border-theme-border rounded-full bg-theme-bg/50 relative shadow-sm">
                <div className="absolute top-5 text-2xl font-serif text-theme-text">
                  {pillar.value[0]}
                </div>
                <div className="absolute bottom-5 text-2xl font-serif text-theme-text">
                  {pillar.value[1]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="text-center border-t border-theme-border pt-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-theme-bg border border-theme-border rotate-45"></div>
          <p className="text-lg md:text-xl font-serif text-theme-text/90 italic leading-relaxed max-w-2xl mx-auto">
            &quot;{summary}&quot;
          </p>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-theme-card/40 backdrop-blur-xl border border-theme-border/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-10 border-b border-theme-border pb-8">
          <h3 className="text-xl font-serif text-theme-text tracking-[0.2em] uppercase">{t('reportTitle')}</h3>
          {isUnlocked && (
            <button
              className="text-theme-muted hover:text-theme-accent transition-colors"
              title={t('saveReport') || 'Save Report'}
              aria-label={t('saveReport') || 'Save Report'}
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className={`prose max-w-none font-serif leading-loose ${!isUnlocked ? 'select-none' : ''}`}>
          <Markdown>{isUnlocked ? report! : teaser!}</Markdown>
        </div>

        {!isUnlocked && (
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-theme-bg via-theme-bg/80 to-transparent flex flex-col items-center justify-end pb-8 md:pb-12 px-4 md:px-6">
            <div className="bg-theme-card/60 backdrop-blur-2xl border border-theme-border/50 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-theme-accent"></div>
              <Lock className="w-6 h-6 text-theme-accent mx-auto mb-4 md:mb-5" strokeWidth={1.5} />
              <h4 className="text-lg font-serif text-theme-text mb-2 md:mb-3 tracking-wide">{t('unlockTitle')}</h4>
              <p className="text-theme-muted text-xs md:text-sm mb-6 md:mb-8 font-serif">{t('unlockDesc')}</p>

              <button
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full bg-theme-accent hover:bg-theme-accent/90 text-theme-bg font-serif tracking-widest uppercase py-3.5 md:py-4 px-4 rounded-full transition-all flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {isPaying ? t('unlockingBtn') : t('unlockBtn')}
              </button>

              <div className="flex items-center justify-center gap-3 md:gap-5 text-theme-muted text-[10px] md:text-xs font-serif uppercase tracking-widest">
                <span className="flex items-center gap-1.5 md:gap-2"><CreditCard className="w-3.5 h-3.5" /> {t('bankCard')}</span>
                <span>{t('paymentMethods')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Placement */}
      <AdUnit slot="1234567890" className="mt-8" />
    </div>
  );
}
