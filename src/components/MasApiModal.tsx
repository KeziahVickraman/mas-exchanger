import React, { useState } from 'react';
import { MasApiConfig } from '../types/currency';
import { saveMasConfig } from '../services/exchangeRateService';
import { X, KeyRound, Check, Code, Globe, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: MasApiConfig;
  onSaveConfig: (config: MasApiConfig) => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [endpointUrl, setEndpointUrl] = useState(currentConfig.endpointUrl || '');
  const [mode, setMode] = useState<MasApiConfig['mode']>(currentConfig.mode);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: MasApiConfig = {
      ...currentConfig,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
      mode,
    };
    saveMasConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing /api/health and /api/exchangerates...');

    try {
      // 1. Check local serverless health
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json().catch(() => ({}));

      // 2. Check /api/exchangerates
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (apiKey) {
        headers['KeyId'] = apiKey;
        headers['x-mas-key-id'] = apiKey;
      }

      const res = await fetch('/api/exchangerates', { headers, signal: AbortSignal.timeout(5000) });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setTestStatus('success');
        setTestMessage(`Live MAS Gateway connected (200 OK). Records received for ${data.endOfDay || 'latest date'}.`);
      } else if (res.status === 401) {
        setTestStatus('error');
        setTestMessage(`/api/exchangerates is active. MAS_KEY_ID is awaiting your key in .env or the KeyId field above.`);
      } else {
        setTestStatus('error');
        setTestMessage(`MAS API returned ${res.status}: ${data.error || data.message || res.statusText}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection test error: ${err.message || 'Network error'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                MAS API & Backend Integration
              </h3>
              <p className="text-xs text-slate-500">
                Configure Monetary Authority of Singapore API or custom backend proxy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Data Source Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('live-interbank')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                mode === 'live-interbank'
                  ? 'border-slate-900 bg-slate-50/80 font-medium'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Live Interbank</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Real-time open market rates</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('mas-benchmark')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                mode === 'mas-benchmark'
                  ? 'border-slate-900 bg-slate-50/80 font-medium'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">MAS Fixing</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Official Singapore fixing</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('custom-backend')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                mode === 'custom-backend'
                  ? 'border-slate-900 bg-slate-50/80 font-medium'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">MAS Backend</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Your API key & proxy</div>
            </button>
          </div>
        </div>

        {/* Custom Backend Inputs */}
        {mode === 'custom-backend' && (
          <div className="space-y-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Backend Proxy Endpoint URL
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://your-api.com/api/mas/rates or /api/rates"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Your backend server endpoint that proxies requests to MAS and securely holds your API key.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MAS API Key / Bearer Token (Optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="mas_live_xxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Stored in client localStorage. Passes via Authorization header to your proxy.
              </span>
            </div>
          </div>
        )}

        {/* MAS API Documentation Notes */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Code className="w-3.5 h-3.5 text-slate-600" />
            <span>MAS API Catalogue Endpoint Configuration:</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            The serverless proxy is located at <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[10px]">/api/exchangerates.ts</code> and <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[10px]">/api/health.ts</code>. It proxies requests directly to MAS API Gateway without hardcoding any keys:
          </p>
          <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto space-y-1">
            <div>GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14</div>
            <div className="text-emerald-400"># KeyId: &lt;MAS_KEY_ID&gt;</div>
          </div>
          <p className="text-[11px] text-slate-500">
            Set <code className="font-mono text-slate-700">MAS_KEY_ID="your_key"</code> in your <code className="font-mono text-slate-700">.env</code> file or provide it via the field above.
          </p>
        </div>

        {/* Test Result Bar */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-start gap-2 ${
              testStatus === 'testing'
                ? 'bg-slate-100 text-slate-700'
                : testStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
            {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {testStatus === 'error' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <span>{testMessage}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
