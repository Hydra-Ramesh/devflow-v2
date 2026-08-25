import { motion } from 'framer-motion';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      
      {/* Background is now handled globally by AnimatedBackground in App.jsx */}

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-6xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/10"
      >
        {/* Left Side: Auth Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white dark:bg-transparent">
          {children}
        </div>

        {/* Right Side: Feature / Testimonial Panel */}
        <div className="hidden md:flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-zinc-900/90 relative overflow-hidden m-2 rounded-[2rem] border border-white/5 shadow-2xl">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6 relative z-10"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              What our <br/> Developers Said.
            </h2>
            <div className="text-white/40 text-6xl font-serif">"</div>
            <p className="text-lg text-white/80 max-w-md font-medium leading-relaxed">
              "Search and find your bug fixes is now easier than ever. Just browse a question and apply the answer if you need to."
            </p>
            
            <div className="pt-4">
              <p className="text-white font-bold text-lg">Mas Parjono</p>
              <p className="text-white/50 text-sm">Fullstack Engineer</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button className="w-12 h-12 rounded-xl bg-orange-400/20 text-orange-400 flex items-center justify-center hover:bg-orange-400/30 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <button className="w-12 h-12 rounded-xl bg-emerald-900/40 text-emerald-500 flex items-center justify-center hover:bg-emerald-900/60 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </motion.div>

          {/* Decorative Star Graphic */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-32 right-12 opacity-50"
          >
             <svg width="200" height="200" viewBox="0 0 100 100" className="text-indigo-500/30 stroke-current">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="none" strokeWidth="1" />
                <path d="M50 15 L52.5 47.5 L85 50 L52.5 52.5 L50 85 L47.5 52.5 L15 50 L47.5 47.5 Z" fill="none" strokeWidth="1" transform="rotate(45 50 50)" />
             </svg>
          </motion.div>

          {/* Overlapping White Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, type: "spring", bounce: 0.4 }}
            className="absolute -bottom-8 -right-8 w-[90%] bg-white rounded-tl-[2.5rem] p-8 lg:p-10 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Get your right answer and right place apply now</h3>
            <p className="text-zinc-500 text-sm">Be among the first founders to experience the next evolution of developer Q&A.</p>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
