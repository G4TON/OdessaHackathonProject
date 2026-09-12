import React from 'react';
import {
  Flame,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Calendar,
  Check,
  RotateCcw,
  Coffee,
  HelpCircle,
} from 'lucide-react';
import { DashboardData, Topic } from '../types';

interface DashboardPageProps {
  data: DashboardData;
  onOpenTopic: (topicId: string) => void;
  onStartStudy: (topicId: string) => void;
  onStartFeynman: (topicId: string) => void;
  onNavigateUpload: () => void;
  onCompleteRevision: (revisionId: string) => void;
  onSelectDocument?: (documentId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  onOpenTopic,
  onStartStudy,
  onStartFeynman,
  onNavigateUpload,
  onCompleteRevision,
  onSelectDocument,
}) => {
  const { stats, todayPlan, topics, activeDocument, allDocuments, upcomingReviews } = data;

  const totalTopics = topics.length;
  const masteredTopics = topics.filter((t) => t.status === 'mastered').length;
  const progressPercent = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner / Active Document Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Active Curriculum</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeDocument?.title || 'Introduction to Data Structures'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            {activeDocument?.description || 'Foundational computer science concepts broken down into mastery modules.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Document Switcher Dropdown */}
          {allDocuments && allDocuments.length > 1 && onSelectDocument && (
            <select
              value={activeDocument?.id}
              onChange={(e) => onSelectDocument(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {allDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.topicsCount} topics)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onNavigateUpload}
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {/* Progress & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Progress</span>
            <span className="text-2xl font-extrabold text-brand-600">{progressPercent}%</span>
          </div>

          <div className="my-3">
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{masteredTopics} of {totalTopics} concepts mastered</span>
            <span className="text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Demonstrated</span>
            </span>
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Streak</span>
            <span className="flex items-center space-x-1 text-2xl font-extrabold text-amber-600">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{stats.current_streak} days</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 my-2">
            Consistent active recall builds long-term retention. 1 Feynman check counts as today's activity.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Longest: <strong>{stats.longest_streak} days</strong></span>
            <span>Total Sessions: <strong>{stats.total_sessions}</strong></span>
          </div>
        </div>

        {/* Study Time / Mastery Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mastery Summary</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {stats.total_mastered} <span className="text-sm font-normal text-slate-500">topics</span>
            </span>
          </div>

          <div className="my-2 flex items-center space-x-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Total Study: <strong>{stats.total_study_minutes} minutes</strong></span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Active learning mode</span>
            <span className="font-semibold text-brand-600">Feynman Technique</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Plan + Weak Areas / Upcoming Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Plan & Learning Path */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Plan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-brand-600" />
                  <span>Today's Study Plan</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alternating deep study, rest intervals, and a final understanding check
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {todayPlan.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  All topics completed for today! Pick an upcoming module or start a revision.
                </div>
              ) : (
                todayPlan.map((item) => {
                  const isBreak = item.type === 'break';
                  const isFeynman = item.type === 'feynman';

                  let statusBadge = (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Upcoming
                    </span>
                  );

                  if (item.status === 'in_progress') {
                    statusBadge = (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                        In Progress
                      </span>
                    );
                  } else if (item.status === 'mastered') {
                    statusBadge = (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Mastered</span>
                      </span>
                    );
                  } else if (item.status === 'needs_review') {
                    statusBadge = (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        Needs Review
                      </span>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isBreak
                          ? 'bg-slate-50/70 border-dashed border-slate-200 text-slate-500'
                          : isFeynman
                          ? 'bg-indigo-50/50 border-indigo-200/80 hover:border-indigo-300'
                          : 'bg-white border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isBreak
                              ? 'bg-slate-200/70 text-slate-600'
                              : isFeynman
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {isBreak ? (
                            <Coffee className="w-4 h-4" />
                          ) : isFeynman ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-semibold text-slate-500">{item.time}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{item.durationMinutes} min</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {item.topicTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {statusBadge}
                        {item.topicId && (
                          <button
                            onClick={() => (isFeynman ? onStartFeynman(item.topicId!) : onStartStudy(item.topicId!))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                              isFeynman
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
                            }`}
                          >
                            <span>{isFeynman ? 'Feynman Check' : 'Study'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Visual Learning Path */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>Learning Path & Progressive Unlocks</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prerequisite tree: topics unlock progressively as you demonstrate understanding
                </p>
              </div>
            </div>

            <div className="space-y-4 relative">
              {topics.map((topic, index) => {
                const isLocked = topic.status === 'locked';
                const isMastered = topic.status === 'mastered';
                const isInProgress = topic.status === 'in_progress';
                const isNeedsReview = topic.status === 'needs_review';

                return (
                  <div
                    key={topic.id}
                    onClick={() => !isLocked && onOpenTopic(topic.id)}
                    className={`p-5 rounded-xl border transition-all relative ${
                      isLocked
                        ? 'bg-slate-50/70 border-slate-200 opacity-75 cursor-not-allowed'
                        : isMastered
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 cursor-pointer'
                        : isNeedsReview
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 cursor-pointer'
                        : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-xs cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                            isMastered
                              ? 'bg-emerald-600 text-white'
                              : isLocked
                              ? 'bg-slate-200 text-slate-500'
                              : isInProgress
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {isMastered ? (
                            <Check className="w-5 h-5" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                topic.difficulty === 'beginner'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : topic.difficulty === 'intermediate'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {topic.difficulty}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">{topic.description}</p>

                          {/* Objectives preview */}
                          {topic.objectives && topic.objectives.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {topic.objectives.slice(0, 2).map((obj) => (
                                <span
                                  key={obj.id}
                                  className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1"
                                >
                                  {obj.mastered ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  )}
                                  <span className="truncate max-w-[200px]">{obj.description}</span>
                                </span>
                              ))}
                              {topic.objectives.length > 2 && (
                                <span className="text-[11px] text-slate-400 font-medium self-center">
                                  +{topic.objectives.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status / CTA */}
                      <div className="flex flex-col items-end space-y-2 shrink-0">
                        {isMastered ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            Mastered
                          </span>
                        ) : isNeedsReview ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            Needs Revision
                          </span>
                        ) : isLocked ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                            Available
                          </span>
                        )}

                        {!isLocked && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartStudy(topic.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              Study ({topic.estimated_minutes}m)
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartFeynman(topic.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                            >
                              Feynman
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Weak Areas / Spaced Repetition Reviews & Info */}
        <div className="space-y-6">
          {/* Spaced Repetition / Upcoming Reviews */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-brand-600" />
                  <span>Upcoming Reviews</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled based on where you struggled or passed
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingReviews.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                  No pending revisions due! Complete a Feynman check to schedule your next spaced review.
                </div>
              ) : (
                upcomingReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          {rev.relativeLabel || 'Upcoming'}
                        </span>
                        <span className="text-[11px] text-slate-400">Interval: {rev.interval_days}d</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {rev.topic_title}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onStartFeynman(rev.topic_id)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                        title="Review Feynman explanation"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onCompleteRevision(rev.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Mark complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feynman Technique Explainer Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Feynman Core Rule</span>
            </div>
            <h4 className="text-lg font-bold mb-2">Passive Reading ≠ Mastery</h4>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              When you explain an idea in plain language without jargon, hidden gaps immediately reveal themselves.
              The AI verifies your reasoning against the actual study material to ensure genuine comprehension before marking complete.
            </p>
            <div className="p-3 bg-white/10 rounded-xl text-[11px] text-slate-200 border border-white/10">
              💡 <strong>Tip:</strong> If you get stuck on a concept, open the study session and re-read the relevant source chunk.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
