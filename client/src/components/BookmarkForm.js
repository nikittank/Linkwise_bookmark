import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProcessingTimeline = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'Processing your bookmark', icon: '📄', description: 'Analyzing URL structure' },
    { id: 2, title: 'Extracting page metadata', icon: '🔍', description: 'Fetching title, description, and favicon' },
    { id: 3, title: 'Generating AI summary', icon: '🤖', description: 'Creating intelligent summary with Jina AI' },
    { id: 4, title: 'Saving to collection', icon: '💾', description: 'Storing in your personal library' }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Processing</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-blue-500 text-white' : ''}
                  ${isUpcoming ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-0.5 h-6 mt-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}
                  `} />
                )}
              </div>

              <div className="flex-1 pb-6">
                <h4 className={`
                  font-medium text-sm mb-1 transition-all duration-300
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${isCompleted ? 'text-green-600 dark:text-green-400' : ''}
                  ${isUpcoming ? 'text-slate-500 dark:text-slate-400' : ''}
                `}>
                  {step.title}
                </h4>
                <p className={`
                  text-xs transition-all duration-300
                  ${isActive ? 'text-slate-600 dark:text-slate-300' : ''}
                  ${isCompleted ? 'text-green-500 dark:text-green-400' : ''}
                  ${isUpcoming ? 'text-slate-400 dark:text-slate-500' : ''}
                `}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BookmarkForm = ({ onBookmarkAdded }) => {
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingStep, setProcessingStep] = useState(1);

  // Simulate processing steps - faster timeline
  useEffect(() => {
    if (loading) {
      const stepTimings = [500, 1000, 1500]; // Faster duration for each step
      let currentStep = 1;
      
      const intervals = stepTimings.map((timing, index) => {
        return setTimeout(() => {
          setProcessingStep(currentStep + 1);
          currentStep++;
        }, timing);
      });

      return () => {
        intervals.forEach(clearTimeout);
      };
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProcessingStep(1);

    try {
      const response = await axios.post('/api/bookmarks', { url, tags });
      onBookmarkAdded(response.data);
      setUrl('');
      setTags('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save bookmark');
    } finally {
      setLoading(false);
      setProcessingStep(1);
    }
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    // Auto-format tags with commas
    if (value.includes(' ') && !value.endsWith(', ')) {
      const formatted = value.replace(/\s+/g, ', ').replace(/,+/g, ',');
      setTags(formatted);
    } else {
      setTags(value);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add New Bookmark</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Save any URL with AI-powered insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/amazing-article"
                className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags <span className="text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                type="text"
                value={tags}
                onChange={handleTagInput}
                placeholder="tech, article, tutorial"
                className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Save Bookmark</span>
            </>
          )}
        </button>
      </form>

      {/* Processing Timeline */}
      {loading && (
        <div className="mt-6">
          <ProcessingTimeline currentStep={processingStep} />
        </div>
      )}
    </div>
  );
};

export default BookmarkForm;