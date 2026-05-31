import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader, PromptBot } from '../components';
import apiFetch from '../utils/api';
import { downloadImage } from '../utils';

const FILTERS = [
  { value: 'all',     label: '🖼️ All' },
  { value: 'shared',  label: '🌐 Shared' },
  { value: 'private', label: '🔒 Private' },
];

const SkeletonCard = () => (
  <div className="shimmer" style={{ borderRadius: 16, aspectRatio: '1/1' }} />
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
    } catch {
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
    } catch {
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
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const allCount     = posts.length;
  const sharedCount  = posts.filter((p) => p.isPublic).length;
  const privateCount = posts.filter((p) => !p.isPublic).length;
  const countMap = { all: allCount, shared: sharedCount, private: privateCount };

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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">My Creations</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">All your AI-generated artwork</p>
            </div>
            <Link to="/create-post" className="btn-primary flex items-center gap-2 self-start sm:self-center">
              <span>✨</span> Generate New
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
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
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f.value ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                  {countMap[f.value]}
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
              {filter === 'all' ? 'Generate your first AI image!' : 'Switch filter to see other images'}
            </p>
            {filter === 'all' && <Link to="/create-post" className="btn-primary">✨ Create First Image</Link>}
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

      {/* Prompt Bot on My Creations page too */}
      <PromptBot onUsePrompt={null} />
    </div>
  );
};

const MyCard = ({ post, onToggleShare, onDelete, toggling }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleDownload = async () => {
    await downloadImage(post._id, post.photo);
  };

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative',
      boxShadow: '0 2px 12px rgba(0,0,0,.1)', background: '#fff',
      transition: 'all .3s', cursor: 'default' }}
      className="dark:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
        {!imgLoaded && <div className="shimmer absolute inset-0" />}
        <img
          src={post.photo}
          alt={post.prompt}
          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block',
            opacity: imgLoaded ? 1 : 0, transition: 'opacity .4s' }}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      {/* Badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: post.isPublic ? 'rgba(34,197,94,.85)' : 'rgba(75,85,99,.8)',
        borderRadius: 20, padding: '3px 8px',
        color: 'white', fontSize: 10, fontWeight: 700,
        backdropFilter: 'blur(4px)',
      }}>
        {post.isPublic ? '🌐 Shared' : '🔒 Private'}
      </div>

      {/* Like count if public */}
      {post.isPublic && post.likeCount > 0 && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(10,10,20,.75)', backdropFilter: 'blur(4px)',
          borderRadius: 20, padding: '3px 8px',
          color: 'white', fontSize: 11, fontWeight: 700,
        }}>❤️ {post.likeCount}</div>
      )}

      {/* Hover overlay */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(10,10,20,.9) 0%, transparent 60%)',
        opacity: 0, transition: 'opacity .25s',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10,
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
      >
        <p style={{ color: 'white', fontSize: 11, lineHeight: 1.4, marginBottom: 8,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.prompt}</p>

        <div style={{ display: 'flex', gap: 5 }}>
          {/* Share/Unshare */}
          <button
            onClick={() => onToggleShare(post._id, post.isPublic)}
            disabled={toggling}
            style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: post.isPublic ? 'rgba(239,68,68,.8)' : 'rgba(34,197,94,.8)',
              color: 'white', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}
          >
            {toggling ? <Loader size="sm" color="#fff" /> : post.isPublic ? '🔒 Unpublish' : '🌐 Publish'}
          </button>

          {/* Download */}
          <button onClick={handleDownload} title="Download"
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.25)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            ⬇️
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(post._id)} title="Delete"
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,.5)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.85)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.5)'}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCreations;
