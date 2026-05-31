import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormField, Loader, QuotaBadge, PromptBot } from '../components';
import { getRandomPrompt } from '../utils';
import apiFetch from '../utils/api';

const PreviewPlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-40">
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm text-gray-400 font-medium text-center px-4">Your generated image will appear here</p>
  </div>
);

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [photo, setPhoto] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState(null);
  const [shareToComm, setShareToComm] = useState(false);

  useEffect(() => { fetchQuota(); }, []);

  const fetchQuota = async () => {
    try {
      const data = await apiFetch('/ai/quota', {}, token);
      setQuota(data);
    } catch {}
  };

  const generateImage = async () => {
    if (!prompt.trim()) { addToast('Please enter a prompt', 'warning'); return; }
    try {
      setGeneratingImg(true);
      const data = await apiFetch('/ai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }, token);

      if (data.blocked) {
        addToast('This prompt violates content guidelines. Please try a different idea! 🎨', 'error');
        return;
      }
      if (data.photo) {
        setPhoto(`data:image/png;base64,${data.photo}`);
        if (data.remaining !== undefined) {
          setQuota((q) => q ? { ...q, remaining: data.remaining, imagesThisWeek: 10 - data.remaining } : q);
        }
        addToast('Image generated! ✨', 'success');
      } else {
        addToast('No image generated. Try a different prompt.', 'warning');
      }
    } catch (err) {
      if (err.status === 429) {
        const resetDate = err.data?.resetDate
          ? new Date(err.data.resetDate).toLocaleDateString()
          : 'next Monday';
        addToast(`Weekly limit reached. Resets ${resetDate}`, 'error');
        setQuota((q) => q ? { ...q, remaining: 0 } : q);
      } else if (err.status === 400 && err.data?.blocked) {
        addToast('Prompt blocked: content guidelines violation. Try something creative! 🎨', 'error');
      } else {
        addToast(err.message || 'Image generation failed', 'error');
      }
    } finally {
      setGeneratingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) { addToast('Please generate an image first', 'warning'); return; }
    try {
      setLoading(true);
      await apiFetch('/post', {
        method: 'POST',
        body: JSON.stringify({ prompt, photo, isPublic: shareToComm }),
      }, token);
      addToast(shareToComm ? 'Shared to community! 🎉' : 'Saved to My Creations!', 'success');
      navigate(shareToComm ? '/' : '/my-creations');
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo;
    a.download = 'artzy-ai-image.png';
    a.click();
  };

  // Called when user clicks "Use This" in Prompt Bot
  const handleUsePrompt = (botPrompt) => {
    setPrompt(botPrompt);
    addToast('Prompt applied! ✨ Click Generate to create your image.', 'success');
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <div className="mb-8 pt-6">
          <div className="inline-flex items-center gap-2 bg-[#6469ff]/10 text-[#6469ff] rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
            ✨ AI Image Generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Create Your Art
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            Describe your vision — or let <strong className="text-[#6469ff]">Artzy Bot 🤖</strong> craft the perfect prompt for you!
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">
            {quota && (
              <QuotaBadge
                remaining={quota.remaining}
                resetDate={quota.resetDate}
                imagesThisWeek={quota.imagesThisWeek}
              />
            )}

            {/* Bot tip banner */}
            <div className="bg-gradient-to-r from-[#6469ff]/10 to-[#8b5cf6]/10 border border-[#6469ff]/20 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Need help with your prompt?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click the <strong>robot button</strong> (bottom-right) to chat with Artzy Bot — it'll craft the perfect prompt from your idea!
                </p>
              </div>
            </div>

            {/* Creator info */}
            <div className="card-base rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Creating as yourself</p>
              </div>
            </div>

            {/* Prompt input */}
            <div className="card-base rounded-2xl p-5">
              <FormField
                labelName="Describe your image"
                name="prompt"
                placeholder="A surrealist oil painting of a cat playing chess in space…"
                value={prompt}
                handleChange={(e) => setPrompt(e.target.value)}
                isSurpriseMe
                handleSurpriseMe={() => setPrompt(getRandomPrompt(prompt))}
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={generatingImg || quota?.remaining === 0}
                  className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                >
                  {generatingImg ? (
                    <><Loader size="sm" color="#fff" /> Generating…</>
                  ) : quota?.remaining === 0 ? (
                    '🚫 Quota Reached'
                  ) : (
                    <><span>✨</span> Generate</>
                  )}
                </button>

                {photo && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-secondary px-4 py-2.5 flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>

            {/* Save / Share */}
            {photo && (
              <form onSubmit={handleSubmit}>
                <div className="card-base rounded-2xl p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Save & Share</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setShareToComm((s) => !s)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${shareToComm ? 'bg-[#6469ff]' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${shareToComm ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Share to Community Showcase</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Make visible to everyone</p>
                    </div>
                  </label>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    {loading ? (
                      <><Loader size="sm" color="#fff" /> Saving…</>
                    ) : shareToComm ? '🌐 Share to Community' : '💾 Save to My Creations'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="card-base rounded-2xl overflow-hidden aspect-square relative">
                {photo ? (
                  <>
                    <img src={photo} alt="generated" className="w-full h-full object-cover" />
                    {generatingImg && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-center">
                          <Loader size="lg" />
                          <p className="text-white text-sm mt-3 font-medium">Regenerating…</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : generatingImg ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#6469ff]/5 to-[#8b5cf6]/5">
                    <Loader size="md" />
                    <div className="text-center px-6">
                      <p className="text-gray-700 dark:text-gray-300 font-semibold">Generating your art…</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This may take 15–30 seconds</p>
                    </div>
                  </div>
                ) : <PreviewPlaceholder />}
              </div>

              <div className="mt-4 bg-gradient-to-r from-[#6469ff]/10 to-[#8b5cf6]/10 rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#6469ff] mb-2">💡 Prompt Tips</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Include an art style: "digital art", "oil painting"</li>
                  <li>• Add lighting: "golden hour", "neon lit"</li>
                  <li>• Specify camera: "50mm lens", "macro shot"</li>
                  <li>• <strong className="text-[#6469ff]">Or use Artzy Bot 🤖 (bottom-right)!</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Bot — passes handler to use prompt in input */}
      <PromptBot onUsePrompt={handleUsePrompt} />
    </div>
  );
};

export default CreatePost;
