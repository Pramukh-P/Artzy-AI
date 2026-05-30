import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, Loader } from '../components';
import apiFetch from '../utils/api';

const FILTERS = [
  { value: 'all', label: '🖼️ All', count: null },
  { value: 'shared', label: '🌐 Shared', count: null },
  { value: 'private', label: '🔒 Private', count: null },
];

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden">
    <div className="shimmer aspect-square rounded-2xl" />
  </div>
);

const MyCreations = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toggling, setToggling] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/post/user/my?filter=${filter}`, {}, token);
      setPosts(data.data || []);
    } catch (err) {
      addToast('Failed to load creations', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleToggleShare = async (id, currentIsPublic) => {
    setToggling(id);
    try {
      const data = await apiFetch(`/post/${id}/share`, { method: 'PATCH' }, token);
      setPosts((prev) => prev.map((p) => p._id === id ? { ...p, isPublic: data.isPublic } : p));
      addToast(data.isPublic ? '🌐 Shared to community!' : '🔒 Removed from community', 'success');
    } catch (err) {
      addToast('Failed to update sharing', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    try {
      await apiFetch(`/post/${id}`, { method: 'DELETE' }, token);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      addToast('Image deleted', 'info');
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  // Counts for filter tabs
  const all = posts;
  const sharedCount = posts.filter((p) => p.isPublic).length;
  const privateCount = posts.filter((p) => !p.isPublic).length;

  const filterWithCounts = FILTERS.map((f) => ({
    ...f,
    count: f.value === 'all' ? posts.length : f.value === 'shared' ? sharedCount : privateCount,
  }));

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <div className="pt-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#6469ff]/10 text-[#6469ff] rounded-full px-4 py-1.5 text-sm font-semibold mb-2">
                🖼️ My Gallery
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                My Creations
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                All your AI-generated artwork in one place
              </p>
            </div>
            <Link to="/create-post" className="btn-primary flex items-center gap-2 self-start sm:self-center">
              <span>✨</span> Generate New
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filterWithCounts.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200
                ${filter === f.value
                  ? 'bg-[#6469ff] text-white shadow-lg shadow-[#6469ff]/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              {f.label}
              {!loading && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f.value ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No creations yet' : filter === 'shared' ? 'No shared images' : 'No private images'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              {filter === 'all'
                ? 'Generate your first AI image and it will appear here!'
                : filter === 'shared'
                ? 'Share your images to the community showcase from your gallery'
                : 'All your images have been shared to the community'}
            </p>
            {filter === 'all' && (
              <Link to="/create-post" className="btn-primary">✨ Create First Image</Link>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
            {posts.map((post) => (
              <MyCard
                key={post._id}
                post={post}
                onToggleShare={handleToggleShare}
                onDelete={handleDelete}
                toggling={toggling === post._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Extended card for My Creations
const MyCard = ({ post, onToggleShare, onDelete, toggling }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = post.photo;
    a.download = `artzy-ai-${post._id}.jpg`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="card rounded-2xl group relative overflow-hidden shadow-card dark:shadow-card-dark bg-white dark:bg-gray-800 hover:shadow-cardhover transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        {!imgLoaded && <div className="absolute inset-0 shimmer rounded-t-2xl" />}
        <img
          src={post.photo}
          alt={post.prompt}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      {/* Status badge */}
      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-10 ${post.isPublic ? 'bg-green-500 text-white' : 'bg-gray-700/80 text-gray-200'}`}>
        {post.isPublic ? '🌐 Shared' : '🔒 Private'}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-xs line-clamp-2 mb-3">{post.prompt}</p>
        <div className="flex gap-1.5">
          {/* Share/Unshare toggle */}
          <button
            onClick={() => onToggleShare(post._id, post.isPublic)}
            disabled={toggling}
            title={post.isPublic ? 'Remove from community' : 'Share to community'}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              post.isPublic
                ? 'bg-red-500/80 hover:bg-red-600/80 text-white'
                : 'bg-green-500/80 hover:bg-green-600/80 text-white'
            }`}
          >
            {toggling ? <Loader size="sm" color="#fff" /> : post.isPublic ? '🔒 Unpublish' : '🌐 Publish'}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            title="Download"
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(post._id)}
            title="Delete"
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500/80 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCreations;
