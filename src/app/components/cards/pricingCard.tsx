'use client';

import { CheckCircle } from 'lucide-react';
import Button from '@/app/components/buttons/button';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  onSelectPlan: () => void;
  className?: string;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  onSelectPlan,
  className = "",
}: PricingCardProps) {
  return (
    <div 
      className={`
        relative bg-[var(--background)] rounded-2xl p-8 transition-all
        ${popular 
          ? 'border-2 border-[var(--primary)] shadow-lg scale-105' 
          : 'border border-[var(--on-background)]/10 hover:shadow-md'
        }
        ${className}
      `}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[var(--primary)] text-[var(--on-primary)] px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-[var(--foreground)]">
            {price}
          </span>
          {period && (
            <span className="text-[var(--on-background)]">
              {period}
            </span>
          )}
        </div>
        <p className="text-[var(--on-background)] mt-2">
          {description}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckCircle size={20} className="text-[var(--secondary)] flex-shrink-0" />
            <span className="text-[var(--on-background)]">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={onSelectPlan}
        variant={popular ? "primary" : "secondary"}
        className="w-full"
      >
        {price === "Grátis" ? "Começar Grátis" : "Escolher Plano"}
      </Button>
    </div>
  );
}
