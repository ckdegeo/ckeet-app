'use client';

import TestimonialCard from '@/app/components/cards/testimonialCard';

type Testimonial = {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

type TestimonialsSectionProps = {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Maria Silva",
    role: "Proprietária da Loja da Maria",
    content: "Aumentei minhas vendas em 300% nos primeiros 6 meses. A plataforma é muito intuitiva e o suporte é excepcional!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "E-commerce de Eletrônicos",
    content: "Migrei de outra plataforma e não me arrependo. Os pagamentos são processados rapidamente e as taxas são justas.",
    rating: 5
  },
  {
    name: "Ana Costa",
    role: "Artesã Digital",
    content: "Consegui profissionalizar meu negócio de artesanato. Agora tenho uma loja linda e funcional!",
    rating: 5
  }
];

export default function TestimonialsSection({
  title = "O que nossos clientes dizem",
  subtitle = "Histórias reais de empreendedores que transformaram seus negócios",
  testimonials = defaultTestimonials,
  className = "",
}: TestimonialsSectionProps) {
  return (
    <section 
      id="testimonials" 
      className={`py-20 ${className}`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              rating={testimonial.rating}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
