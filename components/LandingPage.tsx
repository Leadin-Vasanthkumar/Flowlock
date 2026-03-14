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
  XCircle
} from 'lucide-react';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const STAGGER_CHILDREN_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0E0D] text-white selection:bg-primary/30 overflow-x-hidden pt-20">
      <Navbar />
      
      <main>
        <HeroSection />
        <BenefitsSection />
        <FlowlockLoopSection />
        <ComparisonSection />
        <ProtocolsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-[#0D0E0D]/40">
      <div className="flex items-center gap-2 cursor-pointer w-1/4" onClick={() => window.scrollTo(0,0)}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-black" />
        </div>
        <span className="font-serif text-xl font-medium tracking-tight">Flowlock</span>
      </div>
      
      <nav className="hidden md:flex items-center justify-center gap-10 text-sm font-medium text-accent flex-1">
        <a href="#benefits" className="hover:text-white transition-colors">Science</a>
        <a href="#protocols" className="hover:text-white transition-colors">Protocols</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </nav>

      <div className="flex items-center justify-end gap-6 w-1/4">
        <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer">
          Log in
        </button>
        <button onClick={() => navigate('/signup')} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg">
          Get Started
        </button>
      </div>
    </header>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6 flex flex-col items-center text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[140px] opacity-40 pointer-events-none" />
      
      <motion.div 
        variants={STAGGER_CHILDREN_VARIANTS}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
      >
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-accent mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          The Scientific Productivity Environment
        </motion.div>
        
        <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 leading-[1.05]">
          Focus Scientifically.<br />
          <span className="text-gradient-green">Perform Consistently.</span>
        </motion.h1>
        
        <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-lg md:text-xl text-accent max-w-2xl mb-8 leading-relaxed opacity-80">
          Flowlock manages your work blocks and neural resets. Stop burning out and start performing at your physiological peak.
        </motion.p>
        
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col items-center">
          <button onClick={() => navigate('/signup')} className="px-10 py-4 rounded-full bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_40px_rgba(34,197,94,0.3)] cursor-pointer">
            Enter the Flow State <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>

      {/* Dashboard Preview / Placeholder - Moved Upwards */}
      <motion.div 
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, type: "spring", bounce: 0.3 }}
        className="relative mt-12 w-full max-w-5xl mx-auto px-4"
      >
        <div className="glass-panel rounded-2xl p-1.5 md:p-3 shadow-[0_0_100px_rgba(34,197,94,0.1)] relative z-10 overflow-hidden">
          <div className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden aspect-[16/9] relative flex flex-col justify-center items-center shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Brain className="w-16 h-16 text-primary/20 mb-4" />
                <p className="text-accent/50 font-medium tracking-widest text-sm uppercase">Focus Environment Preview</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: <Timer className="w-6 h-6 text-primary" />,
      title: "Dopamine Management",
      description: "Custom Pomodoro sets (25/50/90 mins) engineered to match your cognitive load and protect dopamine pathways."
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: "Neural Reset Protocols",
      description: "Scientifically backed breaks including NSDR (Non-Sleep Deep Rest) and Bilateral Stimulation to clear cognitive fatigue."
    },
    {
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      title: "Physiological Reset",
      description: "Integrated breathing, stretching, and walking resets designed to actively lower cortisol mid-work."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-orange-400" />,
      title: "Deep Analytics",
      description: "Real-time insights into your focus cycles, physiological state, and long-term productivity trends."
    }
  ];

  return (
    <section id="benefits" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">The Scientific Reset</h2>
          <p className="text-accent text-lg max-w-2xl mx-auto">Four ways Flowlock engineers your environment for sustained peak performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
              <p className="text-accent leading-relaxed">{benefit.description}</p>
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
    <section className="py-24 px-6 bg-white/5 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">The Flowlock Loop</h2>
          <p className="text-accent text-lg">A systematic approach to sustained cognitive output.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[#0D0E0D] border border-primary/30 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <span className="font-serif text-3xl text-primary">{step.num}</span>
              </div>
              <h3 className="text-2xl font-medium mb-4">{step.title}</h3>
              <p className="text-accent leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-[100%] blur-[100px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6">Don't just track time.<br />Manage your brain.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* The Others */}
          <div className="glass-card rounded-3xl p-8 md:p-12 border-red-500/20 bg-red-500/5">
            <h3 className="text-2xl font-medium mb-8 text-white/80">Basic Timers</h3>
            <ul className="space-y-6">
              {[
                "Just a clock ticking down",
                "No guidance on how to rest",
                "Leads to cognitive burnout",
                "Random, unstructured breaks",
                "Scroll social media during breaks"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-accent">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Flowlock */}
          <div className="glass-card rounded-3xl p-8 md:p-12 border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
            <h3 className="text-2xl font-medium mb-8 text-primary">Flowlock</h3>
            <ul className="space-y-6 relative z-10">
              {[
                "Physiological state management",
                "Guided 'Neural Resets'",
                "Dopamine pathway protection",
                "Peak performance protocols",
                "Active recovery techniques"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-lg">{item}</span>
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
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">Featured Protocols</h2>
          <p className="text-accent text-lg">Scientifically validated methods to reset your nervous system.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {protocols.map((protocol, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8 text-center flex flex-col items-center group hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                {protocol.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{protocol.title}</h3>
              <p className="text-accent text-sm leading-relaxed">{protocol.desc}</p>
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
      a: "Standard Pomodoro timers just tell you when to stop working. Flowlock tells you HOW to rest. By focusing on guided physiological resets (like breathing or NSDR) rather than random resting, you actively recover cognitive capacity instead of just pausing."
    },
    {
      q: "Is NSDR actually effective?",
      a: "Yes. Non-Sleep Deep Rest (NSDR) protocols are backed by neuroscience research (including studies from Stanford) for rapid recovery, dopamine replenishment, and reducing stress in short 10-20 minute windows."
    },
    {
      q: "Who is Flowlock for?",
      a: "Flowlock is designed for knowledge workers, deep-work coders, writers, designers, and high-performance students who need to sustain intense focus over long periods without burning out."
    }
  ];

  return (
    <section id="faq" className="py-32 px-6 bg-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl font-medium mb-12 text-center">Frequently Asked Questions</h2>
        
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
        <h2 className="font-serif text-5xl md:text-7xl font-medium mb-8">Ready to master your focus?</h2>
        <p className="text-xl text-accent mb-10 max-w-2xl mx-auto">
          Join thousands of high performers who have upgraded their cognitive environment.
        </p>
        <button onClick={() => navigate('/signup')} className="px-10 py-5 rounded-full bg-primary text-black font-semibold text-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(34,197,94,0.4)] cursor-pointer">
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
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-serif text-xl font-medium">Flowlock</span>
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
