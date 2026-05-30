import React, { useState } from 'react';
import { downloadImage, getInitial, timeAgo } from '../utils';
import ShareModal from './ShareModal';

const Card = ({ _id, name, prompt, photo, isPublic, createdAt, showShare = false, showDownload = true, onToggleShare }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      <div className="card rounded-2xl group relative overflow-hidden shadow-card dark:shadow-card-dark bg-white dark:bg-gray-800 hover:shadow-cardhover transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer rounded-2xl" />
          )}
          <img
            src={photo}
            alt={prompt}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex flex-col justify-end p-4">
          {/* Prompt */}
          <p className="text-white text-xs leading-relaxed line-clamp-3 prompt overflow-y-auto mb-3 max-h-20">
            {prompt}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2">
            {/* Author */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitial(name)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{name}</p>
                {createdAt && <p className="text-gray-300 text-[10px]">{timeAgo(createdAt)}</p>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {showDownload && (
                <button
                  onClick={() => downloadImage(_id, photo)}
                  title="Download"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              {showShare && isPublic && (
                <button
                  onClick={() => setShareOpen(true)}
                  title="Share"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
              {onToggleShare && (
                <button
                  onClick={() => onToggleShare(_id, isPublic)}
                  title={isPublic ? 'Remove from community' : 'Share to community'}
                  className={`w-8 h-8 rounded-lg backdrop-blur-sm flex items-center justify-center text-white transition-colors ${isPublic ? 'bg-green-500/60 hover:bg-red-500/60' : 'bg-white/20 hover:bg-green-500/60'}`}
                >
                  {isPublic ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Shared badge (for My Creations) */}
        {isPublic !== undefined && onToggleShare && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPublic ? 'bg-green-500 text-white' : 'bg-gray-600/80 text-gray-200'}`}>
            {isPublic ? '🌐 Shared' : '🔒 Private'}
          </div>
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
    </>
  );
};

export default Card;
