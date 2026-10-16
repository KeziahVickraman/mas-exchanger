import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MessageSquare, RefreshCw, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  shortname?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class DisqusErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Error loading Disqus community forum',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Disqus embed caught in error boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      const forumUrl = `https://${this.props.shortname || 'mas-exchanger-1'}.disqus.com`;
      return (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4 my-4">
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {this.props.fallbackTitle || 'Community Forum Embed Notice'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Third-party cookies or cross-origin restrictions in this preview environment may require accessing the forum directly or reloading.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Embed</span>
            </button>

            <a
              href={forumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shadow-xs"
            >
              <span>Open on Disqus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
