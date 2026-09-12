import React from 'react';
import {
  Upload,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  Layers,
  Award,
  Play,
  RotateCcw,
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onTryDemo,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Mastery-Based Learning Powered by Feynman Technique</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Turn any learning material into a{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              learning journey.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Upload your study material, get an AI-generated learning plan, and prove what you've learned using the Feynman Technique.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
              <span>Try Demo Curriculum</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero-memorization verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Adaptive spaced repetition</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Works with any PDF notes or textbooks</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explanation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">How It Works</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              The 3-Step Feynman Learning Loop
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-all shadow-xs relative group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Step 1</div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Upload</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload the material you want to learn. Our AI extracts core concepts, creates prerequisite relationships, and builds a realistic study schedule.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-all shadow-xs relative group">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">Step 2</div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Learn</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Get an AI-generated personalised learning path. Study focused topics with Pomodoro intervals and structured learning objectives.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-all shadow-xs relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Step 3</div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Prove It</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Explain concepts in your own words and let AI check your understanding. Pass to unlock subsequent topics, or receive actionable feedback to retry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiator Banner */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-400/20">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>The LearnLoop Difference</span>
          </div>
          <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-4">
            “A topic is not considered complete merely because the student spent time studying it.{' '}
            <span className="text-brand-300 underline decoration-brand-400 decoration-2 underline-offset-4">
              The student must demonstrate understanding.
            </span>”
          </blockquote>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Traditional learning apps measure passive screen time. LearnLoop enforces active recall and self-explanation, triggering spaced reviews whenever you struggle.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">LearnLoop</span>
            <span>— AI Feynman Mastery MVP</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-500">
            <button onClick={onTryDemo} className="hover:text-slate-800 transition-colors">
              Try Demo
            </button>
            <button onClick={onStartLearning} className="hover:text-slate-800 transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
