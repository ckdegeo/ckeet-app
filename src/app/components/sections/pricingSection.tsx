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
    name: "Grátis",
    price: "5.99%",
    period: "+ R$ 0,50",
    description: "Taxa por venda",
    features: [
      "5.99% da venda + R$ 0,50",
      "Produtos ilimitados",
      "Dashboard completo",
      "Gestão de clientes e vendas",
      "PIX integrado"
    ],
    popular: false
  },
  {
    name: "Business",
    price: "R$ 39,90",
    period: "/mês",
    description: "Taxa reduzida para mais lucro",
    features: [
      "3.99% da venda + R$ 0,30",
      "Produtos ilimitados",
      "Dashboard completo",
      "Gestão de clientes e vendas",
      "PIX integrado",
      "Prioridade no suporte"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "R$ 89,90",
    period: "/mês",
    description: "Taxa mínima, máximo lucro",
    features: [
      "1.99% da venda + R$ 0,10",
      "Produtos ilimitados",
      "Dashboard completo",
      "Gestão de clientes e vendas",
      "PIX integrado",
      "Suporte prioritário dedicado",
      "Relatórios avançados"
    ],
    popular: false
  }
];

export default function PricingSection({
  title = "Se quiser diminuir as taxas, nós temos planos para você",
  subtitle = "Quanto mais você cresce, menos taxas você paga",
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
