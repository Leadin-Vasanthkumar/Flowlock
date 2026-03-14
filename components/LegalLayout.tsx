import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0E0D] text-white selection:bg-primary/30 font-sans">
      {/* Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md bg-[#0D0E0D]/40 border-b border-white/[0.05]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
            <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white shadow-sm">Flowlock</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-xs font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </nav>

      <main className="relative pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
              {title}
            </h1>
            <div className="h-1 w-20 bg-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>

          <div className="legal-content prose prose-invert prose-green max-w-none prose-p:text-accent prose-p:leading-relaxed prose-p:font-medium prose-h2:text-white prose-h2:uppercase prose-h2:tracking-tight prose-h2:font-black prose-h2:mt-12 prose-h2:mb-6 prose-strong:text-white prose-li:text-accent prose-li:font-medium">
            {children}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-12 px-6 text-center text-accent text-sm">
        <div className="max-w-7xl mx-auto">
          © {new Date().getFullYear()} Flowlock. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
