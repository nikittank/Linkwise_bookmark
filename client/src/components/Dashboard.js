import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BookmarkForm from './BookmarkForm';
import BookmarkList from './BookmarkList';
import img from '../logo_N.png'

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');

  const fetchBookmarks = async (tag = '') => {
    try {
      const params = tag ? { tag } : {};
      const response = await axios.get('/api/bookmarks', { params });
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks(selectedTag);
  }, [selectedTag]);

  const handleBookmarkAdded = (newBookmark) => {
    setBookmarks([newBookmark, ...bookmarks]);
  };

  const handleBookmarkDeleted = (deletedId) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== deletedId));
  };

  const handleBookmarkReorder = (reorderedBookmarks) => {
    setBookmarks(reorderedBookmarks);
  };

  const handleBookmarkUpdated = (updatedBookmark) => {
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
    ));
  };

  // Get unique tags and calculate stats
  const allTags = bookmarks.reduce((tags, bookmark) => {
    if (bookmark.tags) {
      const bookmarkTags = bookmark.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      return [...tags, ...bookmarkTags];
    }
    return tags;
  }, []);
  const uniqueTags = [...new Set(allTags)];
  
  // Calculate weekly growth (mock data for demo)
  const weeklyGrowth = bookmarks.length > 0 ? Math.round(bookmarks.length * 0.15) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
          
              <img
                src={img}
                alt="Bookmark Cards Preview"
                className="w-10 h-10 object-cover"
              />
         
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Link Wise</h1>

                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Intelligent Web Organization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>
              </div>
              
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-110"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636a9 9 0 1012.728 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 lg:px-8">

        {/* Add Bookmark Form */}
        <div className="mb-8">
          <BookmarkForm onBookmarkAdded={handleBookmarkAdded} />
        </div>

        {/* Simple Filter Section */}
        {uniqueTags.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Filter & Organize</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTag ? `Viewing #${selectedTag} category` : `Browse by categories`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dropdown Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Category
                </label>
                <div className="relative">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    <option value="">All bookmarks ({bookmarks.length})</option>
                    {uniqueTags.map(tag => {
                      const count = bookmarks.filter(bookmark => 
                        bookmark.tags && bookmark.tags.includes(tag)
                      ).length;
                      return (
                        <option key={tag} value={tag}>
                          #{tag} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tag Pills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quick Filter
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !selectedTag
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All ({bookmarks.length})
                  </button>
                  {uniqueTags.map(tag => {
                    const count = bookmarks.filter(bookmark => 
                      bookmark.tags && bookmark.tags.includes(tag)
                    ).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedTag === tag
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        #{tag} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Filter Status */}
            {selectedTag && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {bookmarks.filter(bookmark => bookmark.tags && bookmark.tags.includes(selectedTag)).length} bookmarks with tag "#{selectedTag}"
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTag('')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your bookmarks...</p>
          </div>
        ) : (
          <BookmarkList 
            bookmarks={bookmarks} 
            onBookmarkDeleted={handleBookmarkDeleted}
            onBookmarkReorder={handleBookmarkReorder}
            onBookmarkUpdated={handleBookmarkUpdated}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Link Wise</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span>Intelligent web organization made simple</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;