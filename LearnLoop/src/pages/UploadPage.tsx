import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Calendar,
  Brain,
  ShieldCheck,
  AlignLeft,
  X,
} from 'lucide-react';
import { api } from '../lib/api';

interface UploadPageProps {
  onUploadSuccess: () => void;
  onTryDemo: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  onUploadSuccess,
  onTryDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct text ingestion state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const steps = [
    { label: 'Extracting content from material', icon: FileText },
    { label: 'Identifying major topics & conceptual dependencies', icon: Brain },
    { label: 'Building structured learning path & objectives', icon: Layers },
    { label: 'Creating realistic study schedule & Pomodoro sessions', icon: Calendar },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selected: File) => {
    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf).');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller study document.');
      return;
    }
    setFile(selected);
  };

  const handleUploadAndAnalyze = async () => {
    if (activeTab === 'pdf' && !file) return;
    if (activeTab === 'text' && textContent.trim().length < 30) {
      setError('Please enter at least 30 characters of study material.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentStep(0);

    // Live step progression animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      if (activeTab === 'pdf' && file) {
        await api.uploadPdf(file);
      } else {
        await api.submitTextMaterial(textTitle || 'Uploaded Study Notes', textContent);
      }

      clearInterval(stepInterval);
      setCurrentStep(4);
      setTimeout(() => {
        onUploadSuccess();
      }, 800);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setError(err.message || 'Failed to analyze material. Please check that the content contains readable text.');
    }
  };

  const handleLoadSampleNotes = () => {
    setTextTitle('Operating Systems: Process Synchronization');
    setTextContent(`Critical section problem requires mutual exclusion, progress, and bounded waiting.
When multiple processes access shared data concurrently, race conditions can occur leading to corrupted state.
Semaphores are synchronization tools provided by operating systems. A semaphore S is an integer variable accessed via two atomic operations: wait() and signal().
Deadlocks occur when processes are permanently blocked waiting for resources held by each other. The four necessary conditions for deadlock are mutual exclusion, hold and wait, no preemption, and circular wait.`);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>AI Curriculum Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Upload Your Learning Material
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Upload any lecture slides, textbook chapter, or paste your course notes.
          We will extract the concepts, form prerequisite links, and build your Feynman learning journey.
        </p>
      </div>

      {/* Main Upload / Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'pdf'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-brand-600" />
            <span>Upload PDF Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlignLeft className="w-4 h-4 text-indigo-600" />
            <span>Paste Study Notes / Text</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {!isProcessing ? (
            <div>
              {activeTab === 'pdf' ? (
                /* PDF Upload Tab Content */
                <div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
                        : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {file ? file.name : 'Choose a PDF or drag & drop it here'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      PDF documents with selectable text up to 10MB (approx. 25-30 pages)
                    </p>

                    {file && (
                      <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                        <FileText className="w-4 h-4" />
                        <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="hover:text-red-600 ml-1.5"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Direct Text / Notes Tab Content */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Curriculum Title (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadSampleNotes}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                    >
                      Fill with sample notes
                    </button>
                  </div>

                  <input
                    type="text"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="e.g. Operating Systems: Process Synchronization"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-slate-800"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Paste Study Material / Course Notes
                      </label>
                      <span className="text-xs text-slate-400 font-mono">
                        {textContent.length} characters
                      </span>
                    </div>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows={8}
                      placeholder="Paste your lecture notes, textbook passages, or slides here. We will extract the conceptual topics and generate your Feynman learning path..."
                      className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <strong className="font-bold">Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Bottom Action Row */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Processed strictly server-side & kept private.</span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onTryDemo}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Use Demo Curriculum
                  </button>

                  <button
                    type="button"
                    disabled={activeTab === 'pdf' ? !file : textContent.trim().length < 30}
                    onClick={handleUploadAndAnalyze}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xs ${
                      (activeTab === 'pdf' && file) || (activeTab === 'text' && textContent.trim().length >= 30)
                        ? 'bg-brand-600 hover:bg-brand-700 cursor-pointer shadow-brand-500/20'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span>Generate Learning Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Progress Stages */
            <div className="py-8 px-4 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Analysing your material...</h3>
              <p className="text-xs text-slate-500 mb-8">
                Please wait while our AI breaks down your material into a connected Feynman mastery curriculum.
              </p>

              <div className="space-y-4 text-left">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : isCurrent
                          ? 'bg-brand-50 border-brand-300 text-brand-900 font-semibold shadow-xs'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-brand-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>

                      <div className="text-xs">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
