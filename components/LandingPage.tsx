import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Timer, 
  BarChart3, 
  ChevronDown, 
  Play, 
  Pause, 
  Wind, 
  Footprints, 
  PenTool,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Layout
} from 'lucide-react';
import { ContainerScroll } from './ui/container-scroll-animation';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
} as const;

const STAGGER_CHILDREN_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0E0D] text-white selection:bg-primary/30 overflow-x-hidden pt-24 md:pt-32">
      <Navbar />
      
      <main>
        <HeroSection />
        <div className="-mt-32 md:-mt-40">
          <BenefitsSection />
          <FlowlockLoopSection />
          <FeatureShowcaseSection />
          <ComparisonSection />
          <ProtocolsSection />
          <FAQSection />
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
};
function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md bg-[#0D0E0D]/40 border-b border-white/[0.05]">
      <div className="flex items-center gap-3 cursor-pointer w-1/4 pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-10 h-10 rounded-xl shrink-0 border border-white/10 overflow-hidden shadow-[0_0_12px_rgba(34,197,94,0.3)]">
          <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-white shadow-sm">Flowlock</span>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">Beta</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center justify-center gap-10 text-sm font-medium text-accent flex-1">
        <a href="#benefits" className="hover:text-white transition-colors">Science</a>
        <a href="#protocols" className="hover:text-white transition-colors">Protocols</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </nav>

      <div className="flex items-center justify-end gap-6 w-1/4">
        <button 
          onClick={() => navigate('/login')} 
          className="hidden md:block text-xs font-black uppercase tracking-widest text-[#22C55E]/70 hover:text-[#22C55E] transition-colors cursor-pointer"
        >
          Log in
        </button>
        <button 
          onClick={() => navigate('/signup')} 
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E] text-xs font-black uppercase tracking-widest hover:bg-[#22C55E]/10 hover:border-[#22C55E]/60 transition-all duration-300 cursor-pointer shadow-[0_0_15px_-5px_rgba(34,197,94,0.2)]"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#0D0E0D]">
      <ContainerScroll
        titleComponent={
          <motion.div 
            variants={STAGGER_CHILDREN_VARIANTS}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <motion.h1 
              variants={FADE_UP_ANIMATION_VARIANTS} 
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-12 leading-[0.9] text-white uppercase text-center"
            >
              Don't just track time.<br />
              <span className="text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">Manage your brain.</span>
            </motion.h1>
            
            <motion.p 
              variants={FADE_UP_ANIMATION_VARIANTS} 
              className="text-lg md:text-xl text-accent max-w-xl mb-12 leading-relaxed font-medium opacity-80 text-center"
            >
              The elite environment for deep work and rapid recovery.
            </motion.p>
            
            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col items-center mb-28">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-10 py-5 rounded-full bg-primary text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-5px_rgba(34,197,94,0.4)] ring-4 ring-primary/10 cursor-pointer relative overflow-hidden group"
              >
                <span className="relative z-10">Enter the Flow State</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        }
      >
        <div className="relative w-full group">
          {/* Massive Background Glow */}
          <div className="absolute -inset-20 bg-primary/10 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
          
          <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-primary/60 via-white/10 to-transparent shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_80px_rgba(34,197,94,0.1)] w-full">
            <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-2xl w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />
              <img 
                src="/screencapture-flowlock-lime-vercel-app-app-2026-03-14-12_36_47.png" 
                alt="Flowlock Dashboard Preview" 
                className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-700 block" 
              />
            </div>
            {/* Top Shine Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30" />
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: <Timer className="w-6 h-6 text-primary" />,
      title: "Protect Your Focus",
      description: "Custom focus sets (25/50/90 mins) designed to prevent mental burnout and keep your energy high."
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Rapid Brain Recovery",
      description: "Science-backed breaks that actually clear mental fog and prepare your brain for the next session."
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "Guided Body Resets",
      description: "Integrated breathing and stretching prompts to lower stress levels while you work."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Track Your Energy",
      description: "Real-time insights into your focus cycles and long-term productivity trends."
    }
  ];

  return (
    <section id="benefits" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Features</h2>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Science of Deep Work</h2>
          <p className="text-accent text-lg max-w-2xl mx-auto font-medium opacity-70">Four ways Flowlock optimizes your environment for sustained peak performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-12 hover:bg-white/[0.04] hover:border-primary/40 transition-all duration-700 backdrop-blur-xl group relative overflow-hidden cursor-pointer"
            >
              {/* Premium Glow Effect */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100" />

              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-500 relative z-10">
                {benefit.icon}
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 relative z-10 group-hover:text-primary transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-accent leading-relaxed font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-500 relative z-10 max-w-[90%]">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcaseSection() {
  const showcases = [
    {
      title: "Your Focus Trends",
      imgSrc: "/screencapture-flowlock-lime-vercel-app-app-2026-03-14-13_20_17.png",
      description: "A complete view of your focus history and energy levels."
    },
    {
      title: "Deep Focus Modes",
      imgSrc: "/Screenshot 2026-03-14 130534.png",
      description: "Choose your focus duration based on your current task intensity."
    },
    {
      title: "Science-Backed Resets",
      imgSrc: "/Screenshot 2026-03-14 132525.png",
      description: "Easy-to-follow protocols to clear mental fog rapidly."
    },
    {
      title: "Post-Work Recovery",
      imgSrc: "/Screenshot 2026-03-14 132438.png",
      description: "Follow-up hydration and recovery steps after every win."
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#0D0E0D]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4">The Interface</h2>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6">Built for Performance</h2>
          <p className="text-accent text-xl max-w-2xl mx-auto font-medium opacity-70">A single-view deep dive into the Flowlock environment.</p>
        </div>

        <div className="flex flex-col gap-20">
          {showcases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group flex flex-col items-center"
            >
              <div className="mb-8 text-center px-4">
                <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-accent opacity-60 font-medium max-w-xl mx-auto">{item.description}</p>
              </div>

              {/* Premium Gradient Border Wrapper */}
              <div className="w-full max-w-4xl p-[1px] rounded-[2rem] bg-gradient-to-b from-primary/40 via-white/10 to-transparent group-hover:from-primary/60 transition-all duration-700 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
                <div className="w-full h-full rounded-[1.95rem] overflow-hidden bg-white/[0.06] hover:shadow-[0_0_80px_rgba(34,197,94,0.15)] transition-all duration-700 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <img 
                    src={item.imgSrc} 
                    alt={item.title} 
                    className="w-full h-auto block relative z-10"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowlockLoopSection() {
  const steps = [
    {
      num: "01",
      title: "Choose Your Sprint",
      description: "Select a task and your focus range (25, 50, or 90 minutes) based on your ultradian rhythms."
    },
    {
      num: "02",
      title: "Execute with Intensity",
      description: "Enter deep focus mode with zero distractions, ambient soundscapes, and a premium, glowing UI."
    },
    {
      num: "03",
      title: "Scientifically Guided Reset",
      description: "When the timer ends, Flowlock guides you through a specific Neural Reset to prepare your brain for the next sprint."
    }
  ];

  return (
    <section className="py-24 px-6 bg-white/[0.01] border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Strategy</h2>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Flowlock Loop</h2>
          <p className="text-accent text-lg font-medium opacity-70">A systematic approach to sustained cognitive output.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connecting Line with Glow */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-40 z-10" />

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-[#0D0E0D] border border-primary/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_40px_rgba(34,197,94,0.1)] group-hover:border-primary/50 group-hover:shadow-[0_0_60px_rgba(34,197,94,0.2)] transition-all duration-500">
                <span className="text-3xl font-black text-primary transition-all duration-500 group-hover:scale-110">{step.num}</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{step.title}</h3>
              <p className="text-accent leading-relaxed font-medium opacity-60 group-hover:opacity-100 transition-opacity">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white text-center">Flowlock vs.<br />Everything Else</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* The Others */}
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 md:p-12 transition-all duration-500 group">
            <h3 className="text-xs font-black text-accent uppercase tracking-[0.3em] mb-8">Basic Timers</h3>
            <ul className="space-y-6">
              {[
                "Just a clock ticking down",
                "No guidance on how to rest",
                "Leads to burnout",
                "Random, unstructured breaks",
                "Scroll social media during breaks"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-accent">
                  <XCircle className="w-6 h-6 text-accent/70 shrink-0 mt-0.5" />
                  <span className="text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Flowlock */}
          <div className="bg-gradient-to-b from-white/[0.04] to-transparent border-2 border-primary/30 rounded-[2.5rem] p-10 md:p-12 hover:bg-primary/[0.02] hover:border-primary/50 transition-all duration-700 relative overflow-hidden group shadow-[0_0_60px_rgba(34,197,94,0.15)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Flowlock</h3>
            <ul className="space-y-6 relative z-10">
              {[
                "Mental state management",
                "Guided 'Neural Resets'",
                "Focus pathway protection",
                "Peak performance protocols",
                "Active recovery techniques"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-white hover:text-primary transition-colors duration-300">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                  <span className="text-lg font-black">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProtocolsSection() {
  const protocols = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "NSDR",
      desc: "Deep rest without sleeping. Rapidly replenish dopamine and reduce fatigue."
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: "Box Breathing",
      desc: "Control your autonomic nervous system. Lower heart rate and center focus."
    },
    {
      icon: <Footprints className="w-8 h-8" />,
      title: "Walking Reset",
      desc: "Lateral eye movement to process stress and reset visual fatigue."
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Doodling",
      desc: "Activate the default mode network for creative problem solving."
    }
  ];

  return (
    <section id="protocols" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Science</h2>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">Featured Protocols</h2>
          <p className="text-accent text-lg font-medium opacity-70">Scientifically validated methods to reset your nervous system.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {protocols.map((protocol, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 text-center flex flex-col items-center group hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                {protocol.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">{protocol.title}</h3>
              <p className="text-accent text-sm leading-relaxed font-medium opacity-60 group-hover:opacity-100 transition-opacity">{protocol.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "How is this better than a standard Pomodoro?",
      a: "Standard Pomodoro timers just tell you when to stop working. Flowlock tells you HOW to rest. By focusing on guided mental resets rather than random resting, you actively recover your brain power instead of just pausing."
    },
    {
      q: "Is NSDR actually effective?",
      a: "Yes. Non-Sleep Deep Rest (NSDR) is a proven method for rapid recovery, helping you replenish focus and reduce stress in short 10-20 minute windows."
    },
    {
      q: "Who is Flowlock for?",
      a: "Flowlock is designed for knowledge workers, deep-work coders, writers, designers, and high-performance students who need to sustain intense focus over long periods without burning out."
    }
  ];

  return (
    <section id="faq" className="py-32 px-6 bg-white/[0.01] border-y border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4 text-center">Inquiry</h2>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-12 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <span className="text-lg font-medium pr-8">{question}</span>
        <ChevronDown className={`w-5 h-5 text-accent transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-accent leading-relaxed border-t border-white/5 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Elite Access</h2>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8">Ready to master your focus?</h2>
        <p className="text-xl text-accent mb-12 max-w-2xl mx-auto font-medium opacity-70">
          Join thousands of high performers who have upgraded their cognitive environment.
        </p>
        <button onClick={() => navigate('/signup')} className="px-12 py-6 rounded-[2rem] bg-primary text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_-10px_rgba(34,197,94,0.4)] cursor-pointer">
          Start Your Free Trial
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6 text-center md:text-left">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Flowlock</span>
        </div>
        <div className="text-accent text-sm">
          © {new Date().getFullYear()} Flowlock. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm text-accent">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default LandingPage;
