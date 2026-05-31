import React, { useState } from 'react';
import { downloadImage, getInitial, timeAgo } from '../utils';
import ShareModal from './ShareModal';

const Card = ({
  _id, name, prompt, photo, isPublic, createdAt,
  likeCount = 0, likedByMe = false,
  showShare = false, showDownload = true,
  onToggleShare, onLike,
  highlighted = false,
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [localLiked, setLocalLiked] = useState(likedByMe);
  const [localCount, setLocalCount] = useState(likeCount);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async () => {
    if (!onLike) return;
    const wasLiked = localLiked;
    // Optimistic update
    setLocalLiked(!wasLiked);
    setLocalCount((c) => wasLiked ? Math.max(0, c - 1) : c + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);

    try {
      const result = await onLike(_id);
      if (result) {
        setLocalLiked(result.likedByMe);
        setLocalCount(result.likeCount);
      }
    } catch {
      // Revert
      setLocalLiked(wasLiked);
      setLocalCount(likeCount);
    }
  };

  return (
    <>
      <div
        id={`post-${_id}`}
        className="card"
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all .3s',
          boxShadow: highlighted
            ? '0 0 0 3px #6469ff, 0 8px 30px rgba(100,105,255,.4)'
            : undefined,
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
          {!imgLoaded && (
            <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 16 }} />
          )}
          <img
            src={photo}
            alt={prompt}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{ display: 'block', width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
          />
        </div>

        {/* Hover overlay */}
        <div className="group-hover:flex flex-col max-h-[94.5%] hidden absolute bottom-0 left-0 right-0 bg-[#10131f] m-2 p-3 rounded-xl"
          style={{ display: 'none' }}>
        </div>

        {/* Always-present hover: CSS handles visibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,20,.85) 0%, rgba(10,10,20,.15) 50%, transparent 100%)',
          opacity: 0, transition: 'opacity .3s',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 12, borderRadius: 16,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <p style={{
            color: 'white', fontSize: 12, lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            marginBottom: 8,
          }}>{prompt}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 11, fontWeight: 700,
              }}>{getInitial(name)}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'white', fontSize: 11, fontWeight: 600, margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                {createdAt && <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 10, margin: 0 }}>{timeAgo(createdAt)}</p>}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {/* Like button */}
              {onLike && (
                <button
                  onClick={handleLike}
                  title={localLiked ? 'Unlike' : 'Like'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: localLiked ? 'rgba(239,68,68,.8)' : 'rgba(255,255,255,.2)',
                    backdropFilter: 'blur(4px)',
                    color: 'white', fontSize: 11, fontWeight: 700,
                    transform: likeAnim ? 'scale(1.3)' : 'scale(1)',
                    transition: 'all .2s',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{localLiked ? '❤️' : '🤍'}</span>
                  {localCount > 0 && <span>{localCount}</span>}
                </button>
              )}

              {/* Download */}
              {showDownload && (
                <button
                  onClick={() => downloadImage(_id, photo)}
                  title="Download"
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', transition: 'background .2s',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}

              {/* Share (community posts only) */}
              {showShare && isPublic && (
                <button
                  onClick={() => setShareOpen(true)}
                  title="Share"
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', transition: 'background .2s',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}

              {/* My Creations toggle share */}
              {onToggleShare && (
                <button
                  onClick={() => onToggleShare(_id, isPublic)}
                  title={isPublic ? 'Remove from community' : 'Share to community'}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: isPublic ? 'rgba(34,197,94,.7)' : 'rgba(255,255,255,.2)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', transition: 'all .2s',
                    fontSize: 13,
                  }}
                >
                  {isPublic ? '🌐' : '🔒'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Like count badge (visible always when > 0) */}
        {localCount > 0 && !onToggleShare && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(10,10,20,.75)', backdropFilter: 'blur(4px)',
            borderRadius: 20, padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 3,
            color: 'white', fontSize: 11, fontWeight: 700,
          }}>
            <span>❤️</span> {localCount}
          </div>
        )}

        {/* Shared badge for My Creations */}
        {isPublic !== undefined && onToggleShare && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: isPublic ? 'rgba(34,197,94,.85)' : 'rgba(75,85,99,.8)',
            borderRadius: 20, padding: '3px 8px',
            color: 'white', fontSize: 10, fontWeight: 700,
          }}>
            {isPublic ? '🌐 Shared' : '🔒 Private'}
          </div>
        )}

        {/* Highlight ring animation */}
        {highlighted && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
            border: '3px solid #6469ff',
            animation: 'highlightPulse 1s ease-in-out 3',
          }} />
        )}
      </div>

      {shareOpen && (
        <ShareModal
          postId={_id}
          prompt={prompt}
          photo={photo}
          onClose={() => setShareOpen(false)}
        />
      )}

      <style>{`
        @keyframes highlightPulse {
          0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(100,105,255,.6)}
          50%{opacity:.6;box-shadow:0 0 0 8px rgba(100,105,255,0)}
        }
      `}</style>
    </>
  );
};

export default Card;
