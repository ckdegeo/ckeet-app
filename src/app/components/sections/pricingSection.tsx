'use client';

import PricingCard from '@/app/components/cards/pricingCard';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  onSelectPlan: (planName: string) => void;
  className?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Grátis",
    description: "Perfeito para começar",
    features: [
      "Até 10 produtos",
      "Pagamentos PIX",
      "Dashboard básico",
      "Suporte por email"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "R$ 29",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "Produtos ilimitados",
      "Todos os métodos de pagamento",
      "Analytics avançado",
      "Domínio personalizado",
      "Suporte prioritário"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "R$ 99",
    period: "/mês",
    description: "Para grandes operações",
    features: [
      "Tudo do Professional",
      "API personalizada",
      "Integração avançada",
      "Manager dedicado",
      "SLA garantido"
    ],
    popular: false
  }
];

export default function PricingSection({
  title = "Planos que se adaptam ao seu negócio",
  subtitle = "Escolha o plano ideal para o tamanho da sua operação",
  plans = defaultPlans,
  onSelectPlan,
  className = "",
}: PricingSectionProps) {
  return (
    <section 
      id="pricing" 
      className={`py-20 bg-[var(--surface)] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--foreground)] mb-4">
            {title}
          </h2>
          <p className="text-xl text-[var(--on-background)] max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              onSelectPlan={() => onSelectPlan(plan.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
