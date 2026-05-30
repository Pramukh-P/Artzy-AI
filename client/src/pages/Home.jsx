import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Loader } from '../components';
import apiFetch from '../utils/api';

const SORT_OPTIONS = [
  { value: 'latest', label: '🕒 Latest' },
  { value: 'oldest', label: '📅 Oldest' },
  { value: 'a-z', label: '🔤 A-Z' },
  { value: 'z-a', label: '🔤 Z-A' },
];

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden">
    <div className="shimmer aspect-square rounded-2xl" />
  </div>
);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('latest');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (debouncedSearch) params.append('search', debouncedSearch);
      const data = await apiFetch(`/post?${params}`);
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Hero */}
        <div className="text-center mb-10 pt-6">
          <div className="inline-flex items-center gap-2 bg-[#6469ff]/10 text-[#6469ff] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            ✨ AI-Powered Art Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            The Community{' '}
            <span className="gradient-text">Showcase</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-6">
            Explore stunning AI-generated artwork from our community. Browse, download, and get inspired.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="btn-primary px-8 py-3 text-base">
                🚀 Start Creating Free
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3 text-base">
                Sign In
              </Link>
            </div>
          ) : (
            <Link to="/create-post" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
              <span>✨</span> Generate Image
            </Link>
          )}
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by prompt or creator name…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-base pl-10"
            />
            {searchText && (
              <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-base sm:w-40 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Results header */}
        {debouncedSearch && !loading && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {posts.length === 0 ? 'No results' : `${posts.length} result${posts.length !== 1 ? 's' : ''}`} for
            </span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">"{debouncedSearch}"</span>
            <button onClick={() => setSearchText('')} className="text-xs text-[#6469ff] hover:underline">Clear</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {debouncedSearch ? 'No results found' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              {debouncedSearch
                ? 'Try a different search term'
                : 'Be the first to share your AI-generated art with the community!'}
            </p>
            {!debouncedSearch && (
              <Link to={isAuthenticated ? '/create-post' : '/signup'} className="btn-primary">
                {isAuthenticated ? '✨ Create First Post' : '🚀 Get Started'}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
            {posts.map((post) => (
              <Card
                key={post._id}
                {...post}
                showShare
                showDownload
              />
            ))}
          </div>
        )}

        {/* Stats footer */}
        {!loading && posts.length > 0 && (
          <div className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Showing {posts.length} community creation{posts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
