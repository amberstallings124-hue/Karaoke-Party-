import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Music, Calendar, MapPin, Mic, Send, CheckCircle2, ChevronRight, User, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

// --- Components ---

const AudioWave = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 1000 100" className="w-[200%] h-full">
        <motion.path
          d="M0 50 Q 250 10, 500 50 T 1000 50"
          fill="transparent"
          stroke="#c5a059"
          strokeWidth="0.8"
          animate={{
            d: [
              "M0 50 Q 250 10, 500 50 T 1000 50",
              "M0 50 Q 250 90, 500 50 T 1000 50",
              "M0 50 Q 250 10, 500 50 T 1000 50",
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M0 50 Q 250 30, 500 50 T 1000 50"
          fill="transparent"
          stroke="#c5a059"
          strokeWidth="0.8"
          animate={{
            d: [
              "M0 50 Q 250 70, 500 50 T 1000 50",
              "M0 50 Q 250 30, 500 50 T 1000 50",
              "M0 50 Q 250 70, 500 50 T 1000 50",
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
            delay: -2
          }}
        />
      </svg>
    </div>
  );
};

const FloatingNote: React.FC<{ delay?: number; x?: number }> = ({ delay = 0, x = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x }}
      animate={{ 
        opacity: [0, 0.4, 0],
        y: -200,
        x: x + (Math.random() * 50 - 25)
      }}
      transition={{ 
        duration: 10 + Math.random() * 5,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
      className="absolute text-white/20 select-none pointer-events-none"
    >
      <Music size={16 + Math.random() * 12} />
    </motion.div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    favoriteSong: '',
    message: '',
    plusOne: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const micRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'rsvps'), {
        name: formData.name,
        attending: formData.attending === 'yes',
        favoriteSong: formData.favoriteSong,
        message: formData.message,
        plusOne: formData.plusOne,
        createdAt: serverTimestamp(),
      });

      // 2. Trigger Email Notification via Backend
      try {
        await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            attending: formData.attending === 'yes',
            favoriteSong: formData.favoriteSong,
            message: formData.message,
            plusOne: formData.plusOne,
          }),
        });
      } catch (emailErr) {
        console.warn('Backend notification failed, but RSVP saved to DB:', emailErr);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('RSVP Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-brand-deep overflow-x-hidden">
      {/* --- Ambient Background --- */}
      <AudioWave />
      
      {/* Floating Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingNote key={i} x={Math.random() * 100 - 50 + (i * 10)} delay={i * 2} />
        ))}
      </div>

      {/* Rotating High-End Gold Vintage Mic */}
      <div className="fixed right-0 top-0 h-screen w-1/2 hidden lg:block pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ 
            rotate: [-15, -10, -15],
            y: [0, -20, 0]
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -right-[10%] top-[0%] w-[100%] h-[100%]"
        >
          <div className="relative w-full h-full">
            {/* Vintage Microphone - Refined to match uploaded style */}
            <img 
              src="https://images.unsplash.com/photo-1558584670-40949309ee56?auto=format&fit=crop&q=80&w=1200"
              alt="Vintage Stage Microphone"
              className="w-full h-full object-contain filter saturate-[0.6] sepia(0.2) brightness(0.9) contrast(1.1) opacity-50 mix-blend-screen"
              referrerPolicy="no-referrer"
            />
            {/* Elegant gold overlay to tie it to the theme */}
            <div className="absolute inset-0 bg-brand-gold/5 mix-blend-overlay" />
            
            {/* Seamless Gradients */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-brand-deep/95 to-brand-deep" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-deep via-transparent to-brand-deep" />
          </div>
        </motion.div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Side: Information */}
          <div className="lg:col-span-5 space-y-12">
            <motion.header
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/20 border border-brand-gold/20 mb-8 backdrop-blur-md">
                <Sparkles size={14} className="text-brand-gold" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-gold/60">Invite Only</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-serif premium-gradient-text leading-tight mb-6 p-1">
                Amber's 27th Birthday Party
              </h1>
              
              <div className="flex items-center space-x-3 mb-8 text-brand-gold/70 font-medium tracking-tight">
                <Mic size={18} />
                <span className="text-xl italic font-serif">Karaoke Night Experience</span>
              </div>

              <p className="text-lg text-subtle max-w-sm leading-relaxed">
                We're turning up the volume! Get ready for a night of karaoke, drinks, and non-stop energy.
              </p>
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="space-y-8"
            >
              <div className="group flex items-center space-x-6 p-1">
                <div className="flex-shrink-0 w-14 h-14 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:bg-brand-gold/10 group-hover:border-brand-gold/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                  <Calendar className="text-white/30 group-hover:text-brand-gold transition-colors" size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/30 mb-1">When</h3>
                  <p className="text-lg font-medium text-white/90">Saturday, May 2, 2026</p>
                  <p className="text-xs text-subtle">Party Starts At: 8:00 PM</p>
                </div>
              </div>

              <div className="group flex items-center space-x-6 p-1">
                <div className="flex-shrink-0 w-14 h-14 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:bg-brand-gold/10 group-hover:border-brand-gold/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                  <MapPin className="text-white/30 group-hover:text-brand-gold transition-colors" size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/30 mb-1">Where</h3>
                  <p className="text-lg font-medium text-white/90">30 S Pershing Ave, Apt. 3</p>
                  <p className="text-xs text-subtle">Door Code: 2865</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: RSVP Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
            >
              {/* Subtle accent light in form corner */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <CheckCircle2 size={40} className="text-brand-blue" />
                    </div>
                    <h2 className="text-3xl font-serif mb-4">See you there!</h2>
                    <p className="text-subtle">Your RSVP has been saved to the VIP list.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">Full Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Your Name"
                          className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl px-6 text-white text-sm placeholder:text-white/10 transition-all focus:bg-white/[0.05] focus:border-white/20 outline-none"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">Attending?</label>
                        <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, attending: 'yes'})}
                            className={`flex-1 h-12 rounded-xl text-xs font-medium transition-all ${formData.attending === 'yes' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
                          >
                            Of Course
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, attending: 'no'})}
                            className={`flex-1 h-12 rounded-xl text-xs font-medium transition-all ${formData.attending === 'no' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
                          >
                            Regretfully
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5 mt-auto">
                        <div className="flex items-center space-x-3">
                          <User size={16} className="text-white/30" />
                          <span className="text-sm text-white/60">Bringing a Plus One?</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, plusOne: !formData.plusOne})}
                          className={`w-12 h-6 rounded-full transition-all relative ${formData.plusOne ? 'bg-brand-gold' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: formData.plusOne ? 24 : 4 }}
                            className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">Favorite Karaoke Jam</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Song name or artist"
                            className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl px-6 pr-12 text-white text-sm placeholder:text-white/10 transition-all focus:bg-white/[0.05] focus:border-white/20 outline-none"
                            value={formData.favoriteSong}
                            onChange={(e) => setFormData({...formData, favoriteSong: e.target.value})}
                          />
                          <Music className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/40 ml-1">Personal Message</label>
                        <textarea
                          placeholder="Optional birthday wish..."
                          className="w-full h-32 bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-white text-sm placeholder:text-white/10 transition-all focus:bg-white/[0.05] focus:border-white/20 outline-none resize-none"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                    </div>

                    {error && (
                      <p className="text-xs text-red-500/80 ml-1">{error}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className="w-full h-16 bg-white text-brand-deep rounded-2xl font-bold tracking-tight text-sm flex items-center justify-center space-x-3 transition-shadow hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-brand-deep/30 border-t-brand-deep rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit RSVP</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="relative z-10 pb-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/10">By invitation only</p>
      </footer>
    </main>
  );
}
