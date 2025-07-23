import React from 'react';
import BookmarkCard from './BookmarkCard';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

const BookmarkList = ({ bookmarks, onBookmarkDeleted, onBookmarkReorder, onBookmarkUpdated }) => {
  const {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop(bookmarks, onBookmarkReorder);

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-lg mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">No bookmarks yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">Start building your collection by adding your first bookmark with intelligent summaries!</p>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Paste any URL above to get started!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Your Bookmarks <span className="text-slate-500 dark:text-slate-400 font-normal">({bookmarks.length})</span>
        </h1>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Link Wise
        </div>
      </header>
      
      {/* Elegant Drag and Drop Instructions */}
      {bookmarks.length > 1 && (
        <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <div className="w-8 h-8 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium">Drag and drop bookmarks to reorder them</span>
          </div>
        </div>
      )}
      
      {/* Clean Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookmarks.map((bookmark, index) => (
          <div
            key={bookmark.id}
            draggable
            onDragStart={(e) => {
              if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="button"]')) {
                e.preventDefault();
                return;
              }
              handleDragStart(e, bookmark);
            }}
            onDragOver={(e) => handleDragOver(e, bookmark)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, bookmark)}
            onDragEnd={handleDragEnd}
            className={`
              transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              ${draggedItem?.id === bookmark.id ? 'opacity-50 scale-95' : ''}
              ${dragOverItem?.id === bookmark.id ? 'scale-105 shadow-xl' : ''}
            `}
          >
            <BookmarkCard
              bookmark={bookmark}
              onDelete={onBookmarkDeleted}
              onBookmarkUpdated={onBookmarkUpdated}
              isDragging={draggedItem?.id === bookmark.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkList;