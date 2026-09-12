import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { Topic } from '../types';
import { api } from '../lib/api';
import { formatTime } from '../lib/utils';

interface StudySessionPageProps {
  topicId: string;
  onBackToDashboard: () => void;
  onStartFeynman: (topicId: string) => void;
}

export const StudySessionPage: React.FC<StudySessionPageProps> = ({
  topicId,
  onBackToDashboard,
  onStartFeynman,
}) => {
  const [topic, setTopic] = useState<(Topic & { objectives: any[]; attempts: any[]; sessions: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const data = await api.getTopic(topicId);
      setTopic(data);
      const duration = data.estimated_minutes || 25;
      setTimeLeft(duration * 60);
    } catch (err: any) {
      setError(err.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleFinishTimer();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const duration = topic?.estimated_minutes || 25;
    setTimeLeft(duration * 60);
  };

  const handleFinishTimer = async () => {
    setIsRunning(false);
    setSessionCompleted(true);
    const elapsedMinutes = Math.max(1, Math.round(((topic?.estimated_minutes || 25) * 60 - timeLeft) / 60));
    try {
      await api.recordStudySession(topicId, elapsedMinutes, 'Pomodoro study session');
    } catch (err) {
      console.warn('Failed to log study session:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading study module...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Topic not found'}</p>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Learning Path</span>
      </button>

      {/* Header Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                topic.difficulty === 'beginner'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : topic.difficulty === 'intermediate'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              {topic.difficulty}
            </span>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{topic.estimated_minutes} min estimated study</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{topic.title}</h1>
          <p className="text-slate-600 text-sm leading-relaxed">{topic.description}</p>
        </div>

        {/* Quick CTA to Feynman */}
        <button
          onClick={() => onStartFeynman(topic.id)}
          className="shrink-0 w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm group"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Start Feynman Check</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Two Column Layout: Pomodoro Timer & Objectives | Source Material */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pomodoro Study Aid & Learning Objectives */}
        <div className="space-y-6">
          {/* Pomodoro Timer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
            <div className="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Focused Study Timer</span>
            </div>

            {/* Big Timer Display */}
            <div className="my-4 font-mono text-5xl font-extrabold tracking-tight text-slate-900">
              {formatTime(timeLeft)}
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Study the source material at your own pace. Timer is a study aid and does not auto-complete the topic.
            </p>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={handleStartPause}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-xs ${
                  isRunning
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{timeLeft < (topic.estimated_minutes || 25) * 60 ? 'Resume' : 'Start Focus'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleFinishTimer}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Skip / Done
              </button>
            </div>
          </div>

          {/* Learning Objectives Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>What You Need to Master</span>
            </h3>

            <div className="space-y-3">
              {topic.objectives?.map((obj) => (
                <div key={obj.id} className="flex items-start space-x-2.5 text-xs text-slate-700">
                  <div className="mt-0.5 shrink-0">
                    {obj.mastered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <span className="leading-relaxed">{obj.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Source Material Viewer Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Extracted Source Material</span>
              </div>
              <span className="text-[11px] text-slate-400">Grounded reference</span>
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
              <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 font-normal leading-relaxed text-sm">
                {topic.source_chunk}
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs flex items-start space-x-2.5">
                <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">How to study this for the Feynman Check:</strong> Read the source text carefully, then close your eyes or look away and try to explain it out loud as if explaining to a beginner. Avoid simply memorizing sentences—focus on the intuitive reason <em>why</em> it works!
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Ready to prove what you learned?</h4>
                <p className="text-xs text-slate-500">
                  You will explain this concept in your own words. The AI will evaluate your reasoning against the objectives.
                </p>
              </div>

              <button
                onClick={() => onStartFeynman(topic.id)}
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs"
              >
                <span>Start Feynman Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
