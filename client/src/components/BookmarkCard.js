import React, { useState } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import BookmarkDetailsModal from './BookmarkDetailsModal';

const BookmarkCard = ({ bookmark, onDelete, onBookmarkUpdated }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setShowDeleteModal(false);
    try {
      await axios.delete(`/api/bookmarks/${bookmark.id}`);
      onDelete(bookmark.id);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setIsDeleting(false);
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  // Generate random colors for the card borders (like the reference image)
  const borderColors = [
    'border-orange-300 shadow-orange-100',
    'border-blue-300 shadow-blue-100', 
    'border-green-300 shadow-green-100',
    'border-purple-300 shadow-purple-100',
    'border-pink-300 shadow-pink-100',
    'border-yellow-300 shadow-yellow-100',
    'border-red-300 shadow-red-100',
    'border-indigo-300 shadow-indigo-100'
  ];
  
  const randomBorderColor = borderColors[bookmark.id % borderColors.length];
  
  // Cards should be straight, no rotation
  const randomRotation = 'rotate-0';

  return (
    <article className={`group relative bg-white rounded-3xl border-4 ${randomBorderColor} shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-[1.02] ${randomRotation} cursor-pointer overflow-hidden h-full flex flex-col`}>
      {/* Elegant delete button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          title="Remove bookmark"
        >
          {isDeleting ? (
            <div className="w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Card content */}
      <div className="p-6 pb-4 flex flex-col flex-1">
        {/* Company Logo & Header */}
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {bookmark.favicon ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">
                  {(bookmark.title || 'B').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-sm font-bold text-gray-900">
              {formatUrl(bookmark.url).split('.')[0] || 'Website'}
            </div>
          </div>
        </header>

        {/* Job Title Style */}
        <div className="mb-3 flex-1">
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
            {bookmark.title || 'Untitled Bookmark'}
          </h2>
          <div className="text-sm text-gray-600 font-medium">
            {bookmark.summary ? truncateText(bookmark.summary, 60) : formatUrl(bookmark.url)}
          </div>
        </div>

        {/* Tags Row - Job Card Style */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bookmark.tags && bookmark.tags.split(',').slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
            >
              {tag.trim().toUpperCase()}
            </span>
          ))}
          {!bookmark.tags && (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                BOOKMARK
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                SAVED
              </span>
            </>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="text-xs text-gray-400 font-medium">
            SAVED {new Date(bookmark.created_at).toLocaleDateString().replace(/\//g, '-')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDetailsModal(true);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-lg transition-all duration-200"
              title="View details and options"
            >
              MORE
            </button>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-200"
            >
              VISIT
            </a>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${bookmark.title || 'this bookmark'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bookmark Details Modal */}
      <BookmarkDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        bookmark={bookmark}
        onBookmarkUpdated={onBookmarkUpdated}
        onDelete={onDelete}
      />
    </article>
  );
};

export default BookmarkCard;