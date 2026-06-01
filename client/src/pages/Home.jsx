import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, Loader, PromptBot } from '../components';
import apiFetch from '../utils/api';

const SORT_OPTIONS = [
  { value: 'latest',     label: '🕒 Latest' },
  { value: 'most-liked', label: '❤️ Most Liked' },
  { value: 'oldest',     label: '📅 Oldest' },
  { value: 'a-z',        label: '🔤 A–Z' },
];

const SkeletonCard = () => (
  <div className="shimmer" style={{ borderRadius: 16, aspectRatio: '1/1' }} />
);

const Home = () => {
  const { isAuthenticated, token } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [highlightedPost, setHighlightedPost] = useState(null);
  const highlightTimer = useRef(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 420);
    return () => clearTimeout(t);
  }, [searchText]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (debouncedSearch) params.append('search', debouncedSearch);
      const data = await apiFetch(`/post?${params}`);
      setPosts(data.data || []);
    } catch {
      addToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Handle highlight from share link — scroll to card and highlight for 3-4s
  useEffect(() => {
    if (!highlightId || loading) return;

    const el = document.getElementById(`post-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedPost(highlightId);
      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlightedPost(null), 3500);
    } else {
      // Post might not be in the list if search/sort is active — fetch it
      setSort('latest');
      setSearchText('');
      setTimeout(() => {
        const el2 = document.getElementById(`post-${highlightId}`);
        if (el2) {
          el2.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedPost(highlightId);
          highlightTimer.current = setTimeout(() => setHighlightedPost(null), 3500);
        }
      }, 800);
    }

    return () => clearTimeout(highlightTimer.current);
  }, [highlightId, loading]);

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      addToast('Login to like images ❤️', 'info');
      return null;
    }
    try {
      const data = await apiFetch(`/post/${postId}/like`, { method: 'PATCH' }, token);
      // Update local state
      setPosts((prev) => prev.map((p) =>
        p._id === postId
          ? { ...p, likeCount: data.likeCount, likedByMe: data.likedByMe }
          : p
      ));
      return data;
    } catch {
      addToast('Failed to like', 'error');
      return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#f9fafe] dark:bg-[#0f1117]">
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
            Explore stunning AI-generated artwork. Browse, like, and download.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="btn-primary px-8 py-3 text-base">
                🚀 Start Creating Free
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign In</Link>
            </div>
          ) : (
            <Link to="/create-post" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
              <span>✨</span> Generate Image
            </Link>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by prompt or creator…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-base pl-10"
            />
            {searchText && (
              <button onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none">
                ×
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-base sm:w-44 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Search result info */}
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
                : 'Be the first to share your AI art with the community!'}
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
                onLike={handleLike}
                highlighted={highlightedPost === post._id}
              />
            ))}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {posts.length} community creation{posts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Prompt Bot — available on home page */}
      <PromptBot onUsePrompt={null} />
    </div>
  );
};

export default Home;
