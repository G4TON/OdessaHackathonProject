import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Database,
  Key,
  Globe,
  Cpu,
  Save,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { AiSettings } from '../types';
import { api } from '../lib/api';

interface SettingsPageProps {
  onResetDemo: () => void;
  onResetProgress: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemo,
  onResetProgress,
}) => {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'openrouter' | 'custom'>('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Connection test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
      setProvider(data.provider || 'openai');
      setModel(data.model || 'gpt-4o-mini');
      setBaseUrl(data.base_url || '');
      setSessionMinutes(data.default_session_minutes || 25);
      setBreakMinutes(data.default_break_minutes || 5);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: 'openai' | 'gemini' | 'openrouter' | 'custom') => {
    setProvider(newProvider);
    if (newProvider === 'gemini') {
      setModel('gemini-2.0-flash');
      setBaseUrl('https://generativelanguage.googleapis.com/v1beta/openai/');
    } else if (newProvider === 'openrouter') {
      setModel('meta-llama/llama-3.3-70b-instruct');
      setBaseUrl('https://openrouter.ai/api/v1');
    } else if (newProvider === 'openai') {
      setModel('gpt-4o-mini');
      setBaseUrl('https://api.openai.com/v1');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateSettings({
        provider,
        model,
        base_url: baseUrl,
        api_key: apiKey ? apiKey : undefined,
        default_session_minutes: sessionMinutes,
        default_break_minutes: breakMinutes,
      });
      setSettings(updated);
      setSaveSuccess(true);
      setApiKey(''); // Clear entered raw key
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testConnection({
        provider,
        model,
        base_url: baseUrl,
        api_key: apiKey || undefined,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Network error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Application Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure your AI models, API keys, Pomodoro timers, and demo workspace.
        </p>
      </div>

      {/* Active AI Status Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Currently Selected Provider & Model</div>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="capitalize">{provider}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                {model}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {settings?.is_configured ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>API Key Configured</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo / Local Mode Active</span>
            </span>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: AI Provider Architecture */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>AI Model & Provider Configuration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized OpenAI-compatible interface. Change providers without touching application code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* AI Provider */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-slate-800 bg-white"
              >
                <option value="openai">OpenAI (Official)</option>
                <option value="gemini">Google Gemini (OpenAI-compatible)</option>
                <option value="openrouter">OpenRouter (Multi-model)</option>
                <option value="custom">Custom / Local LLM (Ollama, LM Studio)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                All providers use the unified OpenAI-compatible server adapter.
              </p>
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o-mini, gemini-2.0-flash"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-mono text-slate-800"
              />
              <p className="text-[11px] text-slate-400">
                Exact model identifier used for curriculum and Feynman evaluation.
              </p>
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                API Base URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-mono text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Endpoint URL for the provider. Leave default unless routing through a proxy.
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={settings?.api_key_masked || 'Enter API Key (never shared with browser)'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-mono text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Stored securely server-side. Leave blank to retain existing key.
              </p>
            </div>
          </div>

          {/* Test Connection Button & Status */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {/* Test result display */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Learning Session Preferences */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Learning & Timer Settings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your Pomodoro session lengths and intervals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Study Session Duration (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Break Duration (Minutes)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Settings saved!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Section 3: Demo Mode & Data Management */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span>Demo Mode & Data Reset</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage preloaded demo curriculum and test state
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Reset Demo Curriculum
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restores the "Introduction to Data Structures" preloaded curriculum with 5 core topics.
              </p>
            </div>
            <button
              onClick={onResetDemo}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reload Demo Curriculum</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Reset Learning Progress
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Clears mastered statuses and resets streak so you can run fresh acceptance tests.
              </p>
            </div>
            <button
              onClick={onResetProgress}
              className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Progress & Attempts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
