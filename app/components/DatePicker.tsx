"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export default function DatePicker({ value, onChange }: Props) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or use current date
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(newDate);
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const weekDays = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Weekday headers
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center text-xs font-serif text-theme-muted py-2">
          {day}
        </div>
      );
    });

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = value === dateStr;
      
      let lunarText = '';
      try {
        const solar = Solar.fromYmd(currentYear, currentMonth + 1, i);
        const lunar = solar.getLunar();
        lunarText = lunar.getDayInChinese();
        if (lunarText === '初一') {
          lunarText = lunar.getMonthInChinese() + '月';
        }
      } catch (e) {
        // Ignore lunar errors
      }

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateSelect(i)}
          className={`relative p-2 flex flex-col items-center justify-center rounded-lg transition-colors min-h-[3rem] ${
            isSelected 
              ? 'bg-theme-accent text-theme-bg' 
              : 'hover:bg-theme-accent/10 text-theme-text'
          }`}
        >
          <span className="text-sm font-serif">{i}</span>
          <span className={`text-[10px] font-serif mt-0.5 ${isSelected ? 'text-theme-bg/80' : 'text-theme-muted'}`}>
            {lunarText}
          </span>
        </button>
      );
    }

    return days;
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 120 }, (_, i) => current - i);
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // Display value formatting
  let displayValue = '';
  if (value) {
    try {
      const [y, m, d] = value.split('-');
      const solar = Solar.fromYmd(parseInt(y), parseInt(m), parseInt(d));
      const lunar = solar.getLunar();
      displayValue = language === 'zh' 
        ? `${y}年${m}月${d}日 (农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()})`
        : `${value} (Lunar: ${lunar.getMonthInChinese()} ${lunar.getDayInChinese()})`;
    } catch (e) {
      displayValue = value;
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent border-b border-theme-border py-3 text-theme-text focus:outline-none focus:border-theme-accent transition-colors font-serif text-left"
      >
        <span className={displayValue ? 'text-theme-text' : 'text-theme-muted/50'}>
          {displayValue || (language === 'zh' ? '请选择出生日期' : 'Select birth date')}
        </span>
        <CalendarIcon className="w-4 h-4 text-theme-muted" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full sm:w-[320px] bg-theme-card border border-theme-border rounded-xl shadow-xl p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-theme-accent/10 rounded-full text-theme-muted hover:text-theme-text transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              <select 
                value={currentYear} 
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-transparent text-theme-text font-serif text-sm focus:outline-none cursor-pointer appearance-none text-center"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-theme-bg">{y}{language === 'zh' ? '年' : ''}</option>
                ))}
              </select>
              <select 
                value={currentMonth} 
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="bg-transparent text-theme-text font-serif text-sm focus:outline-none cursor-pointer appearance-none text-center"
              >
                {months.map(m => (
                  <option key={m} value={m} className="bg-theme-bg">{m + 1}{language === 'zh' ? '月' : ''}</option>
                ))}
              </select>
            </div>

            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-theme-accent/10 rounded-full text-theme-muted hover:text-theme-text transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
}
