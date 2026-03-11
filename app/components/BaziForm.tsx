"use client";

import React, { useState, useEffect } from 'react';
import { BaziInput } from '../services/geminiService';
import { Calendar, Clock, User, ArrowRight, Mail, AlertCircle, ShieldCheck, Zap, UserX } from 'lucide-react';
import dynamic from 'next/dynamic';
import { YiIcon } from './YiIcon';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });
import DatePicker from './DatePicker';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';

interface Props {
  onSubmit: (data: BaziInput) => void;
  isLoading: boolean;
  initialData?: BaziInput | null;
}

const STORAGE_KEY = 'bazi_form_data';

export default function BaziForm({ onSubmit, isLoading, initialData }: Props) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<BaziInput & { confirmEmail: string }>({
    name: initialData?.name || '',
    gender: initialData?.gender || 'male',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    email: initialData?.email || '',
    confirmEmail: initialData?.email || ''
  });
  const [emailError, setEmailError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData && !initialData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse saved form data', e);
        }
      }
      setIsLoaded(true);
    }
  }, [initialData]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email' || name === 'confirmEmail') {
      setEmailError('');
    }
  };

  const handleLocationChange = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email !== formData.confirmEmail) {
      setEmailError(t('emailMismatch'));
      return;
    }
    const { confirmEmail, ...submitData } = formData;
    onSubmit(submitData);
  };

  return (
    <main className="w-full mx-auto" aria-labelledby="form-title">
      <header className="text-center mb-12 relative">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" aria-hidden="true">
            <YiIcon className="w-24 h-24" aria-label="Cyber Bazi Logo" />
          </div>
        </div>
        <h1 id="form-title" className="text-4xl md:text-5xl font-serif tracking-[0.15em] text-theme-text mb-4 font-light">
          {t('appTitle')}
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-12 bg-theme-border"></div>
          <p className="text-theme-muted text-xs tracking-[0.4em] uppercase font-serif">{t('appSubtitle')}</p>
          <div className="h-[1px] w-12 bg-theme-border"></div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-serif text-theme-muted tracking-wider">
          <div className="flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-theme-accent/70" />
            <span>{t('featureNoReg')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-theme-accent/70" />
            <span>{t('featureNoInfo')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-theme-accent/70" />
            <span>{t('featureAI')}</span>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-theme-card/40 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-theme-border/30 relative overflow-hidden"
      >
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('nameLabel')}</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('namePlaceholder')}
                className="w-full bg-transparent border-b border-theme-border py-3 text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors font-serif"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('genderLabel')}</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center justify-center py-3 rounded-full border cursor-pointer transition-all ${formData.gender === 'male' ? 'bg-theme-accent border-theme-accent text-theme-bg' : 'bg-transparent border-theme-border text-theme-muted hover:border-theme-accent/50 hover:text-theme-text'}`}>
                <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="sr-only" />
                <span className="font-serif tracking-widest text-sm">{t('genderMale')}</span>
              </label>
              <label className={`relative flex items-center justify-center py-3 rounded-full border cursor-pointer transition-all ${formData.gender === 'female' ? 'bg-theme-accent border-theme-accent text-theme-bg' : 'bg-transparent border-theme-border text-theme-muted hover:border-theme-accent/50 hover:text-theme-text'}`}>
                <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="sr-only" />
                <span className="font-serif tracking-widest text-sm">{t('genderFemale')}</span>
              </label>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('dateLabel')}</label>
            <DatePicker value={formData.date} onChange={handleDateChange} />
          </div>

          {/* Time */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('timeLabel')}</label>
            <div className="relative">
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-theme-border py-3 text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors font-serif"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('locationLabel')}</label>
            <MapPicker value={formData.location} onChange={handleLocationChange} />
          </div>

          {/* Email */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('emailLabel')}</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
                className="w-full bg-transparent border-b border-theme-border py-3 text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors font-serif"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-theme-muted/70 font-serif mt-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              {t('emailHint')}
            </p>
          </div>

          {/* Confirm Email */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-serif text-theme-muted tracking-[0.2em] uppercase">{t('confirmEmailLabel')}</label>
            <div className="relative">
              <input
                type="email"
                name="confirmEmail"
                required
                value={formData.confirmEmail}
                onChange={handleChange}
                placeholder={t('confirmEmailPlaceholder')}
                className={`w-full bg-transparent border-b py-3 text-theme-text placeholder-theme-muted/50 focus:outline-none transition-colors font-serif ${emailError ? 'border-red-500 focus:border-red-500' : 'border-theme-border focus:border-theme-accent'}`}
              />
            </div>
            {emailError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-800 text-xs mt-2 flex items-center gap-1 font-serif"
              >
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </motion.p>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-theme-accent hover:bg-theme-accent/90 text-theme-bg font-serif tracking-[0.2em] uppercase py-5 rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="w-4 h-4 border border-theme-bg/30 border-t-theme-bg rounded-full animate-spin" />
                {t('submittingBtn')}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                {t('submitBtn')}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
