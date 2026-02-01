"use client";

import { Shield, Scale, CheckCircle2, ChevronDown, Gavel } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef } from "react";

export default function Home() {
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
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <Scale className="w-6 h-6 text-teal transition-transform group-hover:rotate-12" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2 pr-4 border-r border-charcoal/10 dark:border-white/10">
            <ThemeToggle />
          </div>

          {/* FIXED: Changed buttons to Links */}
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-teal dark:text-parchment px-4 py-2 hover:bg-teal/5 rounded-sm transition-colors"
          >
            Log In
          </Link>
          {/* 
          <Link
            href="/register"
            className="text-sm font-medium bg-teal text-parchment px-5 py-2 rounded-sm shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Sign Up
          </Link>
          */}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Background Image / Texture */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] dark:opacity-[0.2] grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-parchment/80 via-transparent to-parchment/80 dark:from-[#0A0A0A] dark:via-transparent dark:to-[#0A0A0A]" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            style={{ opacity, scale }}
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] border border-teal/5 dark:border-teal/10 rounded-full"
          />
          <motion.div
            style={{ opacity, scale }}
            animate={{ rotate: -360 }}
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
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-teal/20" />

          <motion.h1 variants={itemVariants} className="font-serif text-8xl md:text-[12rem] text-teal dark:text-parchment tracking-tighter leading-none select-none">
            JurAI
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-2xl md:text-4xl font-serif italic text-slate/80 dark:text-slate/40">
              “AI-Powered Compliance Intelligence”
            </p>
            <p className="text-lg text-charcoal/60 dark:text-parchment/40 max-w-2xl mx-auto font-light leading-relaxed">
              Detect legal risks before you build. A judicial-grade assessment system for modern product teams.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/questionnaire"
              className="relative inline-flex items-center justify-center px-10 py-5 bg-teal text-parchment font-serif text-xl rounded-sm shadow-2xl hover:shadow-teal/30 transition-all duration-500 group overflow-hidden w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center">
                Begin Compliance Review
                <Gavel className="ml-3 w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
              </span>
              <motion.div className="absolute inset-0 bg-charcoal opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}