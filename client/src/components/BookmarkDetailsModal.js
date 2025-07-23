import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EditBookmarkModal from './EditBookmarkModal';
import ConfirmModal from './ConfirmModal';

const BookmarkDetailsModal = ({ isOpen, onClose, bookmark, onBookmarkUpdated, onDelete }) => {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Prevent background scrolling when modal is open - MUST be before any early returns
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  console.log('BookmarkDetailsModal props:', { isOpen, bookmark: bookmark?.id });

  if (!isOpen || !bookmark) {
    console.log('Modal not rendering - isOpen:', isOpen, 'bookmark:', !!bookmark);
    return null;
  }

  // Function to clean and format the AI content
  const cleanAIContent = (content) => {
    if (!content) return 'No summary available.';

    // Clean the AI content by removing any remaining artifacts
    let cleaned = content
      // Remove any remaining markdown formatting that might slip through
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

      // Remove any navigation artifacts that might still exist
      .replace(/^\s*NaN\s*\/\s*NaN\s*/gm, '')
      .replace(/^\s*(Back|Skip navigation|Search|Sign in|YouTube|Home)\s*/gm, '')
      .replace(/Image \d+/g, '')

      // Normalize whitespace and clean up formatting
      .replace(/\s{3,}/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '')
      .trim();

    // Split into paragraphs and ensure quality content
    const paragraphs = cleaned.split(/\n\s*\n/).filter(p => {
      const trimmed = p.trim();
      return trimmed.length > 10 &&
        !trimmed.match(/^(Subscribe|Share|Like|Comment|View|Watch|Play|Settings)$/i) &&
        !trimmed.match(/^\d+:\d+$/) && // Remove timestamps
        !trimmed.match(/^[0-9,]+\s*(views?|likes?|subscribers?)$/i);
    });

    // Join paragraphs with proper spacing
    const result = paragraphs.join('\n\n');

    return result || 'Summary could not be processed properly.';
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cleanedSummary = cleanAIContent(bookmark.summary);
  const shouldTruncate = cleanedSummary.length > 300;
  const displaySummary = showFullSummary || !shouldTruncate
    ? cleanedSummary
    : cleanedSummary.substring(0, 300) + '...';

  const handleDeleteConfirm = async () => {
    try {
      if (onDelete) {
        await onDelete(bookmark.id);
        onClose(); // Close the details modal after deletion
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
    setShowDeleteConfirm(false);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-fadeIn"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-4 border-purple-200 shadow-purple-100 overflow-hidden transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Header - Job Card Style */}
        <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 p-8 border-b border-purple-100">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-110 shadow-sm"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Company Logo & Header */}
          <div className="flex items-start gap-4 mb-4">
            {bookmark.favicon ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center border-2 border-white">
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="w-12 h-12 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-2xl font-bold">
                  {(bookmark.title || 'B').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-700 mb-1">
                {formatUrl(bookmark.url).split('.')[0] || 'Website'}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                {bookmark.title || 'Untitled Bookmark'}
              </h1>
              <div className="text-sm text-gray-600 font-medium">
                {bookmark.summary ? cleanAIContent(bookmark.summary).substring(0, 100) + '...' : formatUrl(bookmark.url)}
              </div>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            {bookmark.tags && bookmark.tags.split(',').slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
              >
                {tag.trim().toUpperCase()}
              </span>
            ))}
            {!bookmark.tags && (
              <>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  BOOKMARK
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  SAVED
                </span>
              </>
            )}
          </div>
        </div>

        {/* Premium Content */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          
          {/* Smart Summary Section */}
          {bookmark.summary && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Smart Summary</h3>
                  <p className="text-sm text-gray-600">Intelligent content analysis</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                  {displaySummary}
                </p>

                {shouldTruncate && (
                  <button
                    onClick={() => setShowFullSummary(!showFullSummary)}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <span>{showFullSummary ? 'Show less' : 'Show more'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showFullSummary ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* URL & Details Card */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Link Details</h3>
                <p className="text-sm text-gray-600">Bookmark information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2 font-medium">Full URL:</div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all font-medium transition-colors duration-200"
                  title={bookmark.url}
                >
                  {bookmark.url}
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Added</div>
                  <div className="text-sm font-bold text-gray-900">{formatDate(bookmark.created_at)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">ID</div>
                  <div className="text-sm font-bold text-gray-900">#{bookmark.id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* All Tags Display */}
          {bookmark.tags && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-600">Bookmark tags</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-green-800 border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>OPEN LINK</span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(bookmark.url);
                // You could add a toast notification here
              }}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-2xl font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>COPY URL</span>
            </button>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-t border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Bookmark #{bookmark.id}</div>
                <div className="text-xs text-gray-600">Link Wise</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>DELETE</span>
              </button>
              
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>EDIT</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${bookmark.title || 'this bookmark'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Bookmark Modal */}
      <EditBookmarkModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        bookmark={bookmark}
        onBookmarkUpdated={onBookmarkUpdated}
      />
    </div>
  );

  // Use React Portal to render the modal outside of any container
  return createPortal(modalContent, document.body);
};

export default BookmarkDetailsModal;