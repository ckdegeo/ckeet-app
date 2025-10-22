'use client';

import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  className?: string;
}

export default function TestimonialCard({
  name,
  role,
  content,
  rating,
  avatar,
  className = "",
}: TestimonialCardProps) {
  return (
    <div 
      className={`
        bg-[var(--background)] 
        border border-[var(--on-background)]/10 
        rounded-2xl 
        p-6 
        hover:shadow-lg 
        transition-all
        ${className}
      `}
    >
      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={`
              ${i < rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
              }
            `} 
          />
        ))}
      </div>

      {/* Testimonial Content */}
      <p className="text-[var(--on-background)] mb-4 italic leading-relaxed">
        &ldquo;{content}&rdquo;
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--primary)]/10 flex items-center justify-center">
            <img 
              src={avatar} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-[var(--foreground)]">
            {name}
          </p>
          <p className="text-sm text-[var(--on-background)]">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}
