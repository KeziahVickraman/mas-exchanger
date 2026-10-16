import React, { useState } from 'react';
import { DiscussionEmbed, CommentCount } from 'disqus-react';
import { MessageSquare, MessageCircle, Shield, ExternalLink, Settings } from 'lucide-react';
import { DisqusErrorBoundary } from './DisqusErrorBoundary';

interface TalkToUsProps {
  articleUrl?: string;
  articleId?: string;
  articleTitle?: string;
}

export const TalkToUs: React.FC<TalkToUsProps> = ({
  articleUrl,
  articleId = 'mas-exchanger-talk-to-us',
  articleTitle = 'Talk to Us — SingaRate Exchange Rates & MAS Discussion',
}) => {
  const [enableSSO, setEnableSSO] = useState(false);
  const [ssoApiKey, setSsoApiKey] = useState('');
  const [ssoRemoteAuth, setSsoRemoteAuth] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Dynamic origin-aware canonical URL
  const currentUrl =
    articleUrl ||
    (typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/talk-to-us`
      : 'https://mas-exchanger-1.disqus.com/talk-to-us');

  const shortname = 'mas-exchanger-1';

  // Base Disqus config matching exact user specifications
  const baseConfig = {
    url: currentUrl,
    identifier: articleId,
    title: articleTitle,
    language: 'en',
  };

  // SSO enhanced config matching exact user specification
  const configWithSSO = {
    ...baseConfig,
    remoteAuthS3: ssoRemoteAuth || '',
    apiKey: ssoApiKey || '',
    sso: {
      name: 'SampleNews',
      button: 'http://example.com/images/samplenews.gif',
      icon: 'http://example.com/favicon.png',
      url: 'http://example.com/login/',
      logout: 'http://example.com/logout/',
      profile_url: 'http://example.com/profileUrlTemplate/{username}',
      width: '800',
      height: '400',
    },
  };

  const activeConfig = enableSSO ? configWithSSO : baseConfig;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Talk to Us
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Community discussions, Singapore exchange rate insights, and MAS feedback forum.
            </p>
          </div>

          {/* Comment Count Badge & Configuration Trigger */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 font-mono">
              <MessageCircle className="w-3.5 h-3.5 text-slate-600" />
              <DisqusErrorBoundary fallbackTitle="Comment counter unavailable">
                <CommentCount shortname={shortname} config={baseConfig}>
                  Comments
                </CommentCount>
              </DisqusErrorBoundary>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
              title="Disqus SSO / Embed Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional SSO Configuration Panel */}
        {showConfig && (
          <div className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Single Sign-On (SSO) Configuration</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSSO}
                  onChange={(e) => setEnableSSO(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                />
                <span className="font-medium">Enable Custom SSO</span>
              </label>
            </div>

            {enableSSO && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Disqus API Key
                  </label>
                  <input
                    type="password"
                    value={ssoApiKey}
                    onChange={(e) => setSsoApiKey(e.target.value)}
                    placeholder="Enter your Disqus public API key..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Remote Auth S3 Payload
                  </label>
                  <input
                    type="password"
                    value={ssoRemoteAuth}
                    onChange={(e) => setSsoRemoteAuth(e.target.value)}
                    placeholder="HMAC-SHA1 authentication payload..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Topics / Guidelines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-slate-900">Money Changer Tips</div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Share live cash rates from The Arcade Raffles Place, People&apos;s Park Complex, and Mustafa Centre.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-slate-900">MAS Benchmark Q&amp;A</div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Ask questions about official 16:00 SGT fixing rates, 100-unit Asian quotes, and MAS API datasets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
          <div className="font-bold text-slate-900">Travel &amp; Multi-Currency</div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Discuss overseas bank card charges, PayNow-UPI/DuitNow cross-border payment experiences.
          </p>
        </div>
      </div>

      {/* Disqus Embedded Discussion Forum */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[400px]">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Forum Feed</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">Channel: {shortname}</span>
          </div>

          <a
            href={`https://${shortname}.disqus.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
          >
            <span>Powered by Disqus</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Embedded Disqus Forum with ErrorBoundary */}
        <div className="disqus-container">
          <DisqusErrorBoundary shortname={shortname} fallbackTitle="Disqus Discussion Forum">
            <DiscussionEmbed shortname={shortname} config={activeConfig} />
          </DisqusErrorBoundary>
        </div>
      </div>
    </div>
  );
};
