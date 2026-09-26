import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo, BrandText } from '../components/ui/BrandLogo';
import {
  MessageSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Sun,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export const Landing: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B111E] text-[#18202B] dark:text-[#E2E8F0] selection:bg-[#17243A]/10">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#101827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/">
          <BrandLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs"
          >
            Join CampusCrew
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-6">
          <MapPin className="w-3.5 h-3.5 text-[#17243A] dark:text-slate-200" />
          <span>Built for Islamabad & Rawalpindi University Students</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-3xl mx-auto">
          Your campus. Your people. Your community.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Students helping students. Discuss elective courses, ask seniors for advice, and exchange notes or textbooks directly on WhatsApp without commercial markups.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-100 dark:text-[#17243A] dark:hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Join CampusCrew</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Explore Campus Feed
          </Link>
        </div>

        {/* Campuses Tagline */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Active Networks:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">FAST Islamabad</span>
          <span>·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">NUST (SEECS / SMME)</span>
          <span>·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">COMSATS Park Road</span>
          <span>·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Bahria University</span>
          <span>·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Air University</span>
        </div>
      </section>

      {/* Visual Representation Section (Clean UI Mockups as per Section 9) */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Discussion UI Mockup */}
          <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <MessageSquare className="w-4 h-4 text-[#17243A] dark:text-slate-300" />
                <span>Peer Discussion Feed</span>
              </div>
              <Badge variant="category">Course Review</Badge>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <Avatar name="Ahmed Khan" size="sm" />
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Ahmed Khan
                </div>
                <div className="text-[11px] text-slate-400">
                  FAST Islamabad · Batch 2026
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Which CS electives are worth taking in 5th semester?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
              Trying to choose between Advanced Programming and Web Systems. Which instructor gives the most hands-on project portfolio for internships?
            </p>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-semibold text-[#17243A] dark:text-slate-200">
                ↑ 24 Upvotes
              </span>
              <span>·</span>
              <span>5 Senior Answers</span>
            </div>
          </div>

          {/* Marketplace UI Mockup */}
          <div className="bg-[#EEF5F0]/80 dark:bg-[#0E2319]/60 border border-[#D9E8DE] dark:border-[#1E432F] rounded-2xl p-5 shadow-sm text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E8DE] dark:border-[#1E432F] mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#193D2D] dark:text-[#91CEA9]">
                <BookOpen className="w-4 h-4" />
                <span>Student Study Marketplace</span>
              </div>
              <Badge variant="free">Free</Badge>
            </div>

            <div className="text-[11px] font-semibold text-[#285943] dark:text-[#88C6A5] mb-1">
              MTH101 · Calculus & Analytical Geometry
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Handwritten Master Notes + Solved Midterms
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
              Clean annotated notes for differentiation, Taylor series, and 5 years of solved university midterms.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#D9E8DE]/80 dark:border-[#1E432F]">
              <span className="text-xs font-bold text-[#285943] dark:text-[#88C6A5]">
                Free (Peer Gift)
              </span>
              <span className="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#285943]">
                Chat on WhatsApp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="px-6 py-12 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#101827]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F7F8FA] dark:bg-[#131D31]">
              <div className="w-8 h-8 rounded-lg bg-[#17243A] text-white flex items-center justify-center mb-3 text-xs font-bold">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Zero Bargaining
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect directly on WhatsApp with fellow students on your campus. Meet at the library or cafeteria for quick handovers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F7F8FA] dark:bg-[#131D31]">
              <div className="w-8 h-8 rounded-lg bg-[#285943] text-white flex items-center justify-center mb-3 text-xs font-bold">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Verified Peers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Built specifically around university departments and batches. Real questions get answered by students who took that exact course.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F7F8FA] dark:bg-[#131D31]">
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center mb-3 text-xs font-bold">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Pass Resources Forward
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Finished with your semester? List your books and handwritten course packs for juniors instead of letting them gather dust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandText size="sm" />
            <span>—</span>
            <span>This is a place where students help each other.</span>
          </div>
          <div>Islamabad & Rawalpindi Campus Network</div>
        </div>
      </footer>
    </div>
  );
};
