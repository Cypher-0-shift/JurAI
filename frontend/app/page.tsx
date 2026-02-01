"use client";

import { Shield, Scale, AlertCircle, CheckCircle2, ChevronDown, User, Settings, Menu, Gavel, Search, Bell, X } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef, useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-teal/10 selection:text-teal">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 w-full z-50 bg-parchment/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-charcoal/5 dark:border-white/5 px-6 py-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <Scale className="w-6 h-6 text-teal transition-transform group-hover:rotate-12" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
          </div>
          <Link href="/settings" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-teal transition-colors">
            Settings
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2 pr-4 border-r border-charcoal/10 dark:border-white/10">
            <ThemeToggle />
          </div>
          <button
            onClick={() => { setIsSignUp(false); setIsModalOpen(true); }}
            className="hidden sm:block text-sm font-medium text-teal dark:text-parchment px-4 py-2 hover:bg-teal/5 rounded-sm transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setIsModalOpen(true); }}
            className="text-sm font-medium bg-teal text-parchment px-5 py-2 rounded-sm shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Sign Up
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Background Image / Texture */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.35] dark:opacity-[0.28] grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-parchment/80 via-transparent to-parchment/80 dark:from-[#0A0A0A] dark:via-transparent dark:to-[#0A0A0A]" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            style={{ opacity, scale }}
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] border border-teal/5 dark:border-teal/10 rounded-full"
          />
          <motion.div
            style={{ opacity, scale }}
            animate={{
              rotate: -360,
            }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] border border-teal/5 dark:border-teal/10 rounded-full"
          />
        </div>

        <motion.div
          style={{ opacity, scale, y }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl space-y-8 relative"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-teal/20" />

          <motion.h1 variants={itemVariants} className="font-serif text-8xl md:text-[12rem] text-teal dark:text-parchment tracking-tighter leading-none select-none">
            JurAI
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-2xl md:text-4xl font-serif italic text-slate/80 dark:text-slate/80">
              “AI-Powered Compliance Intelligence”
            </p>
            <p className="text-lg text-charcoal/60 dark:text-parchment/40 max-w-2xl mx-auto font-light leading-relaxed">
              Detect legal risks before you build. A judicial-grade assessment system for modern product teams, powered by the world's most advanced legal LLMs.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center px-10 py-5 bg-teal text-parchment font-serif text-xl rounded-sm shadow-2xl hover:shadow-teal/30 transition-all duration-500 group overflow-hidden w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center">
                Begin Compliance Review
                <Gavel className="ml-3 w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
              </span>
              <motion.div
                className="absolute inset-0 bg-charcoal opacity-0 group-hover:opacity-10 transition-opacity"
              />
            </Link>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="text-slate/30 text-center"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest mb-2">Scroll to Explore</p>
              <ChevronDown className="w-5 h-5 mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Meet Your AI Team */}
      <section className="py-32 px-6 bg-white dark:bg-[#0D0D0D] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-charcoal/10 dark:via-white/10 to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="font-serif text-5xl text-teal dark:text-parchment">The Judicial Council</h2>
            <div className="w-24 h-1 bg-gold/30 mx-auto rounded-full" />
            <p className="text-slate/70 dark:text-slate/40 max-w-2xl mx-auto text-lg font-light">
              Four specialized intelligence agents designed to scrutinize every aspect of your product's legal standing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Juror",
                role: "Regulatory Risk Analyst",
                desc: "Scans global databases for applicable statutes and quantifies potential liabilities with precision. Combines regulatory detection with advanced risk assessment.",
                icon: Shield,
                id: "RRA-001",
                color: "border-teal/20 dark:border-teal/10",
                image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
              },
              {
                name: "Critic",
                role: "Design Counsel",
                desc: "Evaluates user interface patterns for dark patterns and accessibility violations. Ensures your product remains ethical and inclusive.",
                icon: Scale,
                id: "CRT-009",
                color: "border-gold/20 dark:border-gold/10",
                image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop"
              },
              {
                name: "Judge",
                role: "Compliance Validator",
                desc: "The final authority on product readiness and legal certification. Issues the definitive verdict on market entry and regulatory standing.",
                icon: CheckCircle2,
                id: "JDG-100",
                color: "border-teal/20 dark:border-teal/10",
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop"
              }
            ].map((juror, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                whileHover={{ y: -10 }}
                className={`group relative bg-parchment dark:bg-[#151515] border ${juror.color} rounded-sm transition-all duration-500 cursor-default overflow-hidden h-[450px]`}
              >
                {/* Image Overlay */}
                <motion.div
                  className="absolute inset-0 z-20 transition-opacity duration-500"
                  initial={{ opacity: 1 }}
                  whileHover={{ opacity: 0 }}
                >
                  <img
                    src={juror.image}
                    alt={juror.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-teal/40 mix-blend-multiply opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 text-parchment">
                    <h3 className="font-serif text-3xl mb-1">{juror.name}</h3>
                    <p className="text-gold font-medium text-[10px] uppercase tracking-[0.2em]">{juror.role}</p>
                  </div>
                </motion.div>

                {/* Content (Visible on Hover) */}
                <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="absolute top-6 right-6 font-mono text-[10px] text-slate/20 tracking-widest group-hover:text-teal/40 transition-colors">
                      {juror.id}
                    </div>
                    <div className="mb-8 relative">
                      <div className="absolute inset-0 bg-teal/5 scale-150 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <juror.icon className="w-12 h-12 text-teal/80 stroke-[1.25px] relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h3 className="font-serif text-2xl text-teal dark:text-parchment mb-2">{juror.name}</h3>
                    <p className="text-gold font-medium text-[10px] uppercase tracking-[0.2em] mb-6">
                      {juror.role}
                    </p>
                    <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                      {juror.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-charcoal/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate/40 uppercase tracking-tighter">Status: Active</span>
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 rounded-full bg-teal"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-parchment dark:bg-[#0A0A0A] border-t border-charcoal/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-teal" />
                <span className="font-serif text-2xl font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
              </div>
              <p className="text-sm text-slate/50 max-w-xs font-light">
                The world's first judicial-grade compliance intelligence system for high-growth product teams.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-teal">Platform</h4>
                <ul className="space-y-2 text-sm text-slate/60 font-light">
                  <li className="hover:text-teal cursor-pointer transition-colors">Analysis</li>
                  <li className="hover:text-teal cursor-pointer transition-colors">Case Files</li>
                  <li className="hover:text-teal cursor-pointer transition-colors">Statutes</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-teal">Legal</h4>
                <ul className="space-y-2 text-sm text-slate/60 font-light">
                  <li className="hover:text-teal cursor-pointer transition-colors">Privacy</li>
                  <li className="hover:text-teal cursor-pointer transition-colors">Terms</li>
                  <li className="hover:text-teal cursor-pointer transition-colors">Ethics</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-teal">Connect</h4>
                <ul className="space-y-2 text-sm text-slate/60 font-light">
                  <li className="hover:text-teal cursor-pointer transition-colors">Contact</li>
                  <li className="hover:text-teal cursor-pointer transition-colors">Support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-charcoal/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-mono text-slate/40 uppercase tracking-widest">
              © 2024 JURAI SYSTEMS. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full border border-teal/10 flex items-center justify-center text-teal/40 hover:text-teal hover:border-teal/30 transition-all cursor-pointer">
                <span className="text-xs">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-teal/10 flex items-center justify-center text-teal/40 hover:text-teal hover:border-teal/30 transition-all cursor-pointer">
                <span className="text-xs">in</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-parchment dark:bg-[#151515] rounded-xl shadow-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-teal transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal via-gold to-teal h-1" />
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Scale className="w-8 h-8 text-teal" />
                    <h2 className="font-serif text-3xl font-bold text-teal dark:text-parchment">JurAI</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0A] border border-charcoal/20 dark:border-white/20 rounded-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0A] border border-charcoal/20 dark:border-white/20 rounded-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0A] border border-charcoal/20 dark:border-white/20 rounded-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0A] border border-charcoal/20 dark:border-white/20 rounded-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-teal text-parchment py-3 rounded-sm font-medium shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all active:translate-y-0 mt-6"
                  >
                    {isSignUp ? 'Create Account' : 'Log In'}
                  </button>
                </form>

                {/* Toggle between Login/Signup */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    {' '}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-teal font-medium hover:underline"
                    >
                      {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}