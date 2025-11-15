'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function DashboardMockupSection() {
  return (
    <section className="relative py-6 md:py-8 lg:py-12 overflow-visible bg-[var(--background)] -mt-4 md:-mt-8" style={{ zIndex: 30 }}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(189, 37, 60, 0.03) 0%, transparent 70%)`,
            filter: 'blur(120px)',
            zIndex: 0
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mockup Container */}
          <div className="relative min-h-[250px] sm:min-h-[300px] md:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px] flex items-center justify-center py-4 md:py-8 overflow-visible" style={{ zIndex: 50 }}>
            {/* Main Dashboard Mockup */}
            <motion.div
              className="relative w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-2 sm:px-4 overflow-visible"
              style={{ zIndex: 50 }}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              {/* Shadow/Glow behind */}
              <div 
                className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
                style={{
                  background: `radial-gradient(ellipse, var(--primary) 0%, transparent 70%)`,
                  transform: 'scale(1.1)'
                }}
              />

              {/* Mockup Frame */}
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 md:border-6 lg:border-8 border-gray-900 bg-gray-900">
                {/* Browser Chrome */}
                <div className="bg-gray-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 flex items-center gap-1.5 sm:gap-2 border-b border-gray-700">
                  <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-md px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-1.5 mx-1.5 sm:mx-2 md:mx-4">
                    <div className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 text-center truncate">ckeet.store/dashboard</div>
                  </div>
                </div>

                {/* Dashboard Image */}
                <div className="relative w-full bg-white">
                  <Image
                    src="/dash.jpg"
                    alt="Dashboard Ckeet"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  />
                </div>
              </div>

              {/* Floating Elements - Smaller mockups */}
              <motion.div
                className="absolute -top-12 md:-top-20 -left-4 md:-left-10 lg:-left-20 w-32 md:w-48 lg:w-64 opacity-60 hidden md:block"
                style={{ zIndex: 100 }}
                initial={{ opacity: 0, x: -30, rotate: -12 }}
                animate={{ 
                  opacity: 0.6, 
                  x: 0, 
                  rotate: -12,
                  y: [0, -10, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.8, delay: 0.5 },
                  x: { duration: 0.8, delay: 0.5 },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-gray-200 bg-white">
                  <div className="bg-gray-100 px-3 py-2 flex items-center gap-1.5 border-b border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <div className="relative w-full aspect-video bg-gray-50">
                    <Image
                      src="/dash.jpg"
                      alt="Dashboard preview"
                      fill
                      className="object-cover opacity-80"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-12 md:-bottom-16 -right-4 md:-right-10 lg:-right-20 w-28 md:w-40 lg:w-56 opacity-50 hidden md:block"
                style={{ zIndex: 100 }}
                initial={{ opacity: 0, x: 30, rotate: 12 }}
                animate={{ 
                  opacity: 0.5, 
                  x: 0, 
                  rotate: 12,
                  y: [0, 10, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.8, delay: 0.7 },
                  x: { duration: 0.8, delay: 0.7 },
                  y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                <div className="relative rounded-lg overflow-hidden shadow-lg border-3 border-gray-200 bg-white">
                  <div className="bg-gray-100 px-2 py-1.5 flex items-center gap-1 border-b border-gray-200">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <div className="relative w-full aspect-video bg-gray-50">
                    <Image
                      src="/dash.jpg"
                      alt="Dashboard preview"
                      fill
                      className="object-cover opacity-70"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

