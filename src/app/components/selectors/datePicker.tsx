'use client';

import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Estilos customizados para sobrescrever o CSS padrão
const customStyles = `
  /* Estilos dos dropdowns de mês e ano */
  .react-datepicker__month-dropdown-container,
  .react-datepicker__year-dropdown-container {
    margin: 0 4px !important;
  }

  .react-datepicker__month-dropdown,
  .react-datepicker__year-dropdown {
    background-color: var(--background) !important;
    border: 1px solid var(--on-background) !important;
    border-radius: 8px !important;
    padding: 8px 0 !important;
    width: auto !important;
    min-width: 120px !important;
  }

  .react-datepicker__month-option,
  .react-datepicker__year-option {
    padding: 8px 16px !important;
    margin: 0 !important;
    color: var(--foreground) !important;
    transition: all 0.2s !important;
  }

  .react-datepicker__month-option:hover,
  .react-datepicker__year-option:hover {
    background-color: var(--primary) !important;
    color: var(--on-primary) !important;
  }

  .react-datepicker__month-read-view,
  .react-datepicker__year-read-view {
    visibility: visible !important;
    color: var(--foreground) !important;
    font-weight: 500 !important;
  }

  .react-datepicker__month-read-view--selected-month,
  .react-datepicker__year-read-view--selected-year {
    font-size: 0.9rem !important;
    margin-right: 4px !important;
  }

  .react-datepicker__month-dropdown-container--scroll,
  .react-datepicker__year-dropdown-container--scroll {
    max-height: 200px !important;
    overflow-y: auto !important;
  }

  /* Esconde as setas dos dropdowns padrão */
  .react-datepicker__year-read-view--down-arrow,
  .react-datepicker__month-read-view--down-arrow {
    display: none !important;
  }
  .react-datepicker-wrapper {
    width: 100% !important;
  }

  .react-datepicker {
    font-family: 'Manrope', sans-serif !important;
    background-color: var(--background) !important;
    border: 1px solid var(--on-background) !important;
    border-radius: 16px !important;
    padding: 16px !important;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
    min-width: min-content !important;
    max-width: calc(100vw - 32px) !important;
    width: 320px !important;
  }

  @media (min-width: 768px) {
    .react-datepicker {
      flex-direction: row !important;
    }
  }

  .react-datepicker__month-container {
    float: none !important;
    display: inline-block !important;
    margin: 0 !important;
    width: 100% !important;
    min-width: 280px !important;
  }

  @media (min-width: 768px) {
      /* Remove estilos do segundo mês */
  }

  /* Ajustes para mobile */
  @media (max-width: 767px) {
    .react-datepicker__month-container {
      padding: 8px !important;
    }
  }

  .react-datepicker__month-container {
    background-color: var(--background) !important;
  }

  .react-datepicker__header {
    background-color: var(--background) !important;
    border-bottom: none !important;
    padding: 0 !important;
  }

  .react-datepicker__current-month {
    color: var(--foreground) !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    margin-bottom: 8px !important;
  }

  .react-datepicker__day-name {
    color: var(--on-background) !important;
    margin: 4px !important;
    width: 2rem !important;
    font-weight: 500 !important;
  }

  .react-datepicker__day {
    position: relative !important;
    color: var(--foreground) !important;
    margin: 4px !important;
    width: 2rem !important;
    height: 2rem !important;
    line-height: 2rem !important;
    border-radius: 9999px !important;
    transition: all 0.2s !important;
    font-weight: 500 !important;
  }

  .react-datepicker__day--outside-month {
    color: var(--on-background) !important;
    opacity: 0.3 !important;
    font-weight: 400 !important;
  }

  .react-datepicker__day:hover:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled) {
    background-color: var(--primary) !important;
    opacity: 0.1 !important;
    border-radius: 9999px !important;
    color: var(--foreground) !important;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-range:not(.react-datepicker__day--outside-month) {
    background-color: var(--primary) !important;
    color: var(--on-primary) !important;
    opacity: 1 !important;
    font-weight: 600 !important;
  }

  .react-datepicker__day--keyboard-selected:not(.react-datepicker__day--outside-month) {
    background-color: var(--primary) !important;
    color: var(--on-primary) !important;
    opacity: 0.8 !important;
  }

  .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--outside-month) {
    background-color: var(--primary) !important;
    color: var(--on-primary) !important;
    opacity: 0.5 !important;
  }

  .react-datepicker__day--disabled {
    color: var(--on-background) !important;
    opacity: 0.3 !important;
    pointer-events: none !important;
  }

  /* Garante que todos os dias tenham o mesmo tamanho */
  .react-datepicker__day,
  .react-datepicker__day-name {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }

  .react-datepicker__navigation {
    top: 16px !important;
  }

  .react-datepicker__navigation--previous {
    left: 16px !important;
  }

  .react-datepicker__navigation--next {
    right: 16px !important;
  }

  .react-datepicker__navigation-icon::before {
    display: none !important;
  }

  .react-datepicker__year-read-view--down-arrow,
  .react-datepicker__month-read-view--down-arrow {
    display: none !important;
  }

  .react-datepicker__month {
    margin: 0 !important;
  }
`;
import { Calendar } from "lucide-react";
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  label?: string;
  error?: string;
  className?: string;
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  error,
  className = "",
  startDate,
  endDate,
  onChange,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (dates: [Date | null, Date | null]) => {
    onChange(dates);
    if (dates[0] && dates[1]) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <div
          className={`
            w-full
            px-4 py-3
            rounded-full
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            transition-all
            outline-none
            focus-within:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            cursor-pointer
            flex items-center justify-between
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--on-background)]" />
            <span className={!startDate ? "text-[var(--on-background)]" : ""}>
              {startDate && endDate
                ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                : "Selecione o período"}
            </span>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="fixed md:absolute z-50 mt-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 md:top-auto">
            <style>{customStyles}</style>
            <ReactDatePicker
              selected={startDate}
              onChange={handleChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              locale={ptBR}
              monthsShown={1}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              minDate={new Date("1900-01-01")}
              maxDate={new Date("2100-12-31")}
              yearItemNumber={9}
              showFourColumnMonthYearPicker
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled
              }) => (
                <div className="flex items-center justify-between px-2 py-2">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    type="button"
                    className={`
                      p-1 rounded-full
                      hover:bg-[var(--primary)] hover:bg-opacity-10
                      transition-colors
                      disabled:opacity-30
                      text-[var(--foreground)]
                    `}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[var(--foreground)] font-medium">
                    {format(date, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    type="button"
                    className={`
                      p-1 rounded-full
                      hover:bg-[var(--primary)] hover:bg-opacity-10
                      transition-colors
                      disabled:opacity-30
                      text-[var(--foreground)]
                    `}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}