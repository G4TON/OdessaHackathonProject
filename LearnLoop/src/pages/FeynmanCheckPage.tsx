import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Award,
  RotateCcw,
  Lightbulb,
  Check,
  X,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Topic, FeynmanAttempt } from '../types';
import { api } from '../lib/api';

interface FeynmanCheckPageProps {
  topicId: string;
  onBackToDashboard: () => void;
  onBackToStudy: (topicId: string) => void;
  onTopicMastered: () => void;
}

export const FeynmanCheckPage: React.FC<FeynmanCheckPageProps> = ({
  topicId,
  onBackToDashboard,
  onBackToStudy,
  onTopicMastered,
}) => {
  const [topic, setTopic] = useState<(Topic & { objectives: any[]; attempts: FeynmanAttempt[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Result state after submission
  const [evaluationResult, setEvaluationResult] = useState<{
    passed: boolean;
    score: number;
    strengths: string[];
    missing_concepts: string[];
    incorrect_concepts: string[];
    feedback: string;
    retry_prompt: string;
  } | null>(null);

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const data = await api.getTopic(topicId);
      setTopic(data);
      // If there was a previous attempt, pre-fill for fast iteration
      if (data.attempts && data.attempts.length > 0) {
        const lastAttempt = data.attempts[data.attempts.length - 1];
        setExplanation(lastAttempt.student_explanation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load topic for Feynman check');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!explanation.trim()) {
      setError('Please write an explanation in your own words before submitting.');
      return;
    }

    setEvaluating(true);
    setError(null);

    try {
      const res = await api.submitFeynmanCheck(topicId, explanation);
      setEvaluationResult(res.evaluation);

      // If passed, trigger progress update callback
      if (res.evaluation.passed) {
        onTopicMastered();
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    // Keep explanation in text area so student can iterate on their mistakes!
    setEvaluationResult(null);
  };

  const wordCount = explanation.trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Preparing Feynman Check...</p>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onBackToStudy(topicId)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Study Session</span>
        </button>

        <button
          onClick={onBackToDashboard}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Dashboard
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>The Feynman Check</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Explain it like you're teaching someone else.
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Topic:{' '}
          <span className="font-bold text-white underline decoration-brand-400 underline-offset-4">
            {topic?.title}
          </span>
          . Use simple language and plain intuition. Avoid merely quoting the textbook.
        </p>
      </div>

      {/* If Result is Present, Show Passed or Failed Interface */}
      {evaluationResult ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          {evaluationResult.passed ? (
            /* PASSED VIEW */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Mastery Demonstrated!
                    </div>
                    <h2 className="text-2xl font-extrabold text-emerald-950">Topic Mastered</h2>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Understanding verified against source material and objectives. Next topic unlocked!
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right bg-white px-5 py-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Feynman Score</div>
                  <div className="text-3xl font-black text-emerald-600">{evaluationResult.score} / 100</div>
                </div>
              </div>

              {/* Feedback Narrative */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                <strong className="font-semibold text-slate-900 block mb-1">AI Mentor Assessment:</strong>
                {evaluationResult.feedback}
              </div>

              {/* Strengths Checklist */}
              {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    What You Explained Well
                  </h3>
                  <div className="space-y-2">
                    {evaluationResult.strengths.map((str, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleTryAgain}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Edit / Polish Explanation
                </button>

                <button
                  onClick={onBackToDashboard}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs"
                >
                  <span>Continue to Dashboard & Next Topic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* FAILED / TRY AGAIN VIEW */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Not Quite There
                    </div>
                    <h2 className="text-2xl font-extrabold text-amber-950">Almost there — let's strengthen it</h2>
                    <p className="text-xs text-amber-700 mt-0.5">
                      The topic remains incomplete until understanding is fully demonstrated.
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right bg-white px-5 py-3 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Feynman Score</div>
                  <div className="text-3xl font-black text-amber-600">{evaluationResult.score} / 100</div>
                </div>
              </div>

              {/* Feedback Narrative */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                <strong className="font-semibold text-slate-900 block mb-1">AI Mentor Feedback:</strong>
                {evaluationResult.feedback}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* What you got right */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What you got right</span>
                  </h3>
                  {evaluationResult.strengths && evaluationResult.strengths.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-emerald-900">
                      {evaluationResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No strong conceptual points identified yet.</p>
                  )}
                </div>

                {/* What needs work */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>What needs work</span>
                  </h3>
                  {evaluationResult.missing_concepts && evaluationResult.missing_concepts.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-amber-900">
                      {evaluationResult.missing_concepts.map((m, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Missing core conceptual depth.</p>
                  )}
                </div>
              </div>

              {/* Guiding Hint / Retry Prompt */}
              {evaluationResult.retry_prompt && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Guiding Hint for Next Attempt:</strong>
                    <span>{evaluationResult.retry_prompt}</span>
                  </div>
                </div>
              )}

              {/* Try Again CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => onBackToStudy(topicId)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Review Source Material Again
                </button>

                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* INPUT FORM VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Learning Objectives to Address */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Objectives to Hit</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Make sure your explanation addresses these points clearly:
              </p>
            </div>

            <div className="space-y-2.5">
              {topic?.objectives?.map((obj) => (
                <div
                  key={obj.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>{obj.description}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
              💡 <strong>Feynman Rule:</strong> Pretend you're explaining this to an intelligent 12-year-old or a friend from another major. Use intuitive analogies!
            </div>
          </div>

          {/* Right 2 Columns: Explanation Input Text Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your Explanation
                </label>
                <span
                  className={`text-xs font-mono font-medium ${
                    wordCount < 20 ? 'text-slate-400' : 'text-brand-600 font-bold'
                  }`}
                >
                  {wordCount} words
                </span>
              </div>

              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain this concept in your own words... What is it? How does it work under the hood? Why is it useful and what are its trade-offs?"
                rows={12}
                disabled={evaluating}
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 leading-relaxed resize-none transition-all placeholder:text-slate-400"
              />

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Evaluated against the uploaded source material & objectives
              </span>

              <button
                onClick={handleEvaluate}
                disabled={evaluating || !explanation.trim()}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-xs ${
                  evaluating || !explanation.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer'
                }`}
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Evaluating Explanation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Check My Understanding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
