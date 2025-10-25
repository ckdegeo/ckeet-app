'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Eye, EyeOff, Check } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  error?: string;
  className?: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export default function ColorPicker({
  label,
  error,
  className = "",
  value,
  onChange,
  presetColors = [
    '#bd253c', // primary
    '#3700B3', // primary-variant
    '#970b27', // secondary
    '#018786', // secondary-variant
    '#B00020', // error
    '#FFFFFF', // background
    '#171717', // foreground
  ]
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isValidHex, setIsValidHex] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateHex = (color: string) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Adiciona # se o usuário não digitou
    if (newValue.length > 0 && !newValue.startsWith('#')) {
      const withHash = `#${newValue}`;
      setInputValue(withHash);
      setIsValidHex(validateHex(withHash));
      if (validateHex(withHash)) {
        onChange(withHash);
      }
      return;
    }

    setIsValidHex(validateHex(newValue));
    if (validateHex(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setInputValue(color);
    setIsValidHex(true);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <div className="flex gap-2">
          {/* Input de Cor */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className={`
                w-full
                pl-4 pr-10 py-3
                rounded-full
                bg-transparent
                border border-[var(--on-background)]
                text-[var(--foreground)]
                placeholder:text-[var(--on-background)]
                transition-all
                outline-none
                focus:border-[var(--primary)]
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${!isValidHex ? "border-[var(--error)]" : ""}
                ${className}
              `}
              placeholder="#000000"
            />
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-[var(--on-background)]"
              style={{ backgroundColor: isValidHex ? value : '#FFFFFF' }}
            />
          </div>

          {/* Botão de Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              p-3
              rounded-full
              border border-[var(--on-background)]
              text-[var(--foreground)]
              hover:bg-[var(--primary)] hover:bg-opacity-10
              transition-colors
            `}
          >
            {isOpen ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Color Picker */}
        {isOpen && (
          <div className="absolute z-10 mt-2 p-4 bg-[var(--background)] border border-[var(--on-background)] rounded-2xl shadow-lg">
            <HexColorPicker 
              color={value} 
              onChange={onChange}
              style={{
                width: '100%',
                aspectRatio: '1',
              }}
            />

            {/* Cores Predefinidas */}
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--on-background)] mb-2">
                Cores do Design System
              </p>
              <div className="grid grid-cols-7 gap-2">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(color)}
                    className={`
                      w-8 h-8 
                      rounded-full 
                      border-2
                      flex items-center justify-center
                      transition-all
                      ${color === value ? 'border-[var(--primary)]' : 'border-transparent hover:border-[var(--on-background)]'}
                    `}
                    style={{ backgroundColor: color }}
                  >
                    {color === value && (
                      <Check 
                        size={16} 
                        className={color === '#FFFFFF' ? 'text-black' : 'text-white'} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {(!isValidHex || error) && (
        <span className="text-sm text-[var(--error)]">
          {error || "Formato de cor inválido. Use #RGB ou #RRGGBB"}
        </span>
      )}
    </div>
  );
}
