import React, { useState, useRef } from 'react';
import { Post, User, ReactionType } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { CommentSection } from './CommentSection';
import { MessageSquare, Bookmark } from 'lucide-react';

// ─── Reaction definitions ─────────────────────────────────────────────────────
const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'Relatable', emoji: '😂', label: 'Relatable', color: 'text-amber-500' },
  { type: 'Helpful',   emoji: '💡', label: 'Helpful',   color: 'text-yellow-500' },
  { type: 'Support',   emoji: '🤝', label: 'Support',   color: 'text-blue-500'   },
  { type: 'Vibe',      emoji: '🔥', label: 'Vibe',      color: 'text-rose-500'   },
];

// Total reactions count helper
function totalReactions(reactions: Record<ReactionType, number>): number {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

// ─── Animated Reaction Icon ───────────────────────────────────────────────────
const ReactionIcon: React.FC<{
  emoji: string;
  label: string;
  color: string;
  onClick: () => void;
  isActive: boolean;
}> = ({ emoji, label, color, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={`React with ${label}`}
    className={`
      flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 select-none
      hover:scale-125 active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-700
      ${isActive ? 'scale-110' : ''}
    `}
    style={{ animation: isActive ? 'reaction-bounce 0.35s ease' : undefined }}
  >
    <span className="text-xl leading-none" role="img" aria-hidden="true">
      {emoji}
    </span>
    <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive ? color : 'text-slate-500 dark:text-slate-400'}`}>
      {label}
    </span>
  </button>
);

// ─── PostCard Props ───────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onReact: (postId: string, reactionType: ReactionType) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onAddComment: (postId: string, text: string) => Promise<void>;
}

// ─── PostCard Component ───────────────────────────────────────────────────────
export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onReact,
  onSave,
  onAddComment,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = totalReactions(post.reactions);
  const userReaction = post.userReaction;
  const activeReactionDef = userReaction ? REACTIONS.find((r) => r.type === userReaction) : null;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try { await onSave(post.id); } finally { setIsSaving(false); }
  };

  const handleReact = async (reactionType: ReactionType) => {
    if (isReacting) return;
    setIsReacting(true);
    setShowReactionMenu(false);
    try { await onReact(post.id, reactionType); } finally { setIsReacting(false); }
  };

  const openMenu = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowReactionMenu(true);
  };

  const closeMenu = () => {
    hideTimeout.current = setTimeout(() => setShowReactionMenu(false), 200);
  };

  return (
    <>
      {/* Keyframe style injected once */}
      <style>{`
        @keyframes reaction-bounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1.1); }
        }
        @keyframes reaction-menu-in {
          from { opacity: 0; transform: translateY(6px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .reaction-menu { animation: reaction-menu-in 0.18s ease forwards; }
      `}</style>

      <article className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-3.5 transition-shadow hover:shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={post.authorName} size="md" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {post.authorName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-medium text-[#17243A] dark:text-slate-300">{post.authorUniversity}</span>
                <span>·</span>
                <span>{post.authorBatch}</span>
                <span>·</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <Badge variant="category">{post.category}</Badge>
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${post.isSaved ? 'text-[#17243A] dark:text-slate-200' : ''}`}
              title={post.isSaved ? 'Saved' : 'Save post'}
              aria-label={post.isSaved ? 'Remove from saved' : 'Save post'}
            >
              <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <h3 className="text-base sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug tracking-tight">
          {post.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Attached Media / Picture */}
        {post.mediaUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 max-h-96 flex items-center justify-center">
            {post.mediaUrl.startsWith('data:video/') || post.mediaUrl.endsWith('.mp4') ? (
              <video
                src={post.mediaUrl}
                controls
                className="max-h-96 w-full object-contain rounded-xl"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="max-h-96 w-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
        )}

        {/* Reaction summary bar */}
        {total > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {REACTIONS.filter((r) => post.reactions[r.type] > 0).map((r) => (
              <span
                key={r.type}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                <span role="img" aria-label={r.label}>{r.emoji}</span>
                <span className="font-medium tabular-nums">{post.reactions[r.type]}</span>
              </span>
            ))}
            <span className="text-xs text-slate-400 ml-0.5">{total} {total === 1 ? 'reaction' : 'reactions'}</span>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">

            {/* React button with hover popover */}
            <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
              <button
                onClick={() => {
                  if (userReaction) {
                    handleReact(userReaction); // toggle off
                  } else {
                    setShowReactionMenu((v) => !v);
                  }
                }}
                disabled={isReacting}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] select-none
                  ${userReaction
                    ? 'bg-[#17243A] text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                aria-label={userReaction ? `Remove ${userReaction} reaction` : 'React to this post'}
              >
                {activeReactionDef ? (
                  <>
                    <span role="img" aria-label={activeReactionDef.label} className="text-sm">{activeReactionDef.emoji}</span>
                    <span>{activeReactionDef.label}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true" className="text-sm">👍</span>
                    <span>React</span>
                  </>
                )}
              </button>

              {/* Hover Reaction Popover */}
              {showReactionMenu && (
                <div
                  className="reaction-menu absolute bottom-full left-0 mb-2 bg-white dark:bg-[#1C2A40] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl px-1 py-2 flex items-end gap-0.5 z-50"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  {REACTIONS.map((r) => (
                    <ReactionIcon
                      key={r.type}
                      emoji={r.emoji}
                      label={r.label}
                      color={r.color}
                      isActive={userReaction === r.type}
                      onClick={() => handleReact(r.type)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Comment button */}
            <button
              onClick={() => setShowComments((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px]
                ${showComments
                  ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              aria-expanded={showComments}
              aria-label={`${post.commentCount} comments`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="tabular-nums">{post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            {post.authorUniversity} Community
          </span>
        </div>

        {/* Comments */}
        {showComments && (
          <CommentSection
            comments={post.comments || []}
            postId={post.id}
            currentUser={currentUser}
            onAddComment={onAddComment}
          />
        )}
      </article>
    </>
  );
};
