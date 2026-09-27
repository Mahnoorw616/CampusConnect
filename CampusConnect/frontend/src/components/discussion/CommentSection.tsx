import React, { useState } from 'react';
import { Comment, User, ReactionType, PublicProfile } from '../../types';
import { formatTimeAgo } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Send, Smile, Reply, MoreVertical, Trash2, Edit2, CornerDownRight } from 'lucide-react';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  Relatable: '💯',
  Helpful: '💡',
  Support: '🤝',
  Vibe: '✨',
};

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  currentUser: User | null;
  onAddComment: (postId: string, text: string) => Promise<void>;
  onEditComment?: (postId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment?: (postId: string, commentId: string) => Promise<void>;
  onCommentReaction?: (postId: string, commentId: string, reactionType: ReactionType) => Promise<void>;
  onCommentReply?: (postId: string, commentId: string, text: string) => Promise<void>;
  onViewProfile?: (profile: PublicProfile) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onCommentReaction,
  onCommentReply,
  onViewProfile,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for active inline reply and edit
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeReactionPopoverId, setActiveReactionPopoverId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, commentText);
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim() || !onCommentReply) return;
    try {
      await onCommentReply(postId, commentId, replyText);
      setReplyText('');
      setActiveReplyId(null);
    } catch {
      /* handled in parent */
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editText.trim() || !onEditComment) return;
    try {
      await onEditComment(postId, commentId, editText);
      setActiveEditId(null);
    } catch {
      /* handled in parent */
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 space-y-4">
      {/* Existing comments list */}
      <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
            No comments yet. Be the first student to respond!
          </p>
        ) : (
          comments.map((comment) => {
            const isAuthor = currentUser && (currentUser.id === comment.authorId || (comment as any).authorId?._id === currentUser.id);

            return (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() =>
                      onViewProfile?.({
                        id: comment.authorId,
                        name: comment.authorName,
                        university: comment.authorUniversity,
                      })
                    }
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Avatar name={comment.authorName} size="sm" />
                  </button>

                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-800 relative group">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            onViewProfile?.({
                              id: comment.authorId,
                              name: comment.authorName,
                              university: comment.authorUniversity,
                            })
                          }
                          className="font-semibold text-slate-900 dark:text-slate-200 hover:underline"
                        >
                          {comment.authorName}
                        </button>
                        <span className="text-[11px] text-slate-400">· {comment.authorUniversity}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">{formatTimeAgo(comment.createdAt)}</span>

                        {isAuthor && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeMenuId === comment.id && (
                              <div className="absolute right-0 top-6 z-20 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 text-xs">
                                <button
                                  onClick={() => {
                                    setActiveEditId(comment.id);
                                    setEditText(comment.content);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteComment?.(postId, comment.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {activeEditId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setActiveEditId(null)}
                            className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(comment.id)}
                            className="px-2 py-1 text-[11px] bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 rounded font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}

                    {/* Reaction Bar & Reply Link */}
                    <div className="flex items-center gap-3 mt-2 pt-1 text-[11px] text-slate-500">
                      {/* Comment Reaction Popover Trigger */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveReactionPopoverId(
                              activeReactionPopoverId === comment.id ? null : comment.id
                            )
                          }
                          className={`flex items-center gap-1 hover:text-primary-600 transition-colors ${comment.userReaction ? 'text-primary-600 font-semibold' : ''
                            }`}
                        >
                          <Smile className="w-3.5 h-3.5" />
                          {comment.userReaction ? REACTION_EMOJIS[comment.userReaction] : 'React'}
                        </button>

                        {activeReactionPopoverId === comment.id && (
                          <div className="absolute left-0 bottom-6 z-20 flex items-center gap-1 p-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-full shadow-lg">
                            {(['Relatable', 'Helpful', 'Support', 'Vibe'] as ReactionType[]).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  onCommentReaction?.(postId, comment.id, type);
                                  setActiveReactionPopoverId(null);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-base transition-transform hover:scale-125"
                                title={type}
                              >
                                {REACTION_EMOJIS[type]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 hover:text-[#17243A] dark:hover:text-slate-200 transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" /> Reply
                      </button>

                      {/* Comment Reaction Badges */}
                      {comment.reactions &&
                        Object.entries(comment.reactions).some(([_, count]) => count > 0) && (
                          <div className="flex items-center gap-1 ml-auto">
                            {Object.entries(comment.reactions).map(
                              ([type, count]) =>
                                count > 0 && (
                                  <span
                                    key={type}
                                    className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px]"
                                  >
                                    {REACTION_EMOJIS[type as ReactionType]} {count}
                                  </span>
                                )
                            )}
                          </div>
                        )}
                    </div>

                    {/* Inline Reply Input */}
                    {activeReplyId === comment.id && (
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleReplySubmit(comment.id); }}
                        className="flex gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.authorName}...`}
                          className="flex-1 text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-slate-500 text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="px-3 py-1.5 text-xs bg-[#17243A] hover:bg-[#101827] text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                        >
                          Send
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Nested Replies Thread */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-8 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2 text-xs">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                        <button
                          onClick={() =>
                            onViewProfile?.({
                              id: reply.authorId,
                              name: reply.authorName,
                              university: reply.authorUniversity,
                            })
                          }
                          className="hover:opacity-80 transition-opacity shrink-0"
                        >
                          <Avatar name={reply.authorName} size="sm" />
                        </button>
                        <div className="flex-1 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg px-2.5 py-1.5 border border-slate-200/50 dark:border-slate-700/50">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <button
                              onClick={() =>
                                onViewProfile?.({
                                  id: reply.authorId,
                                  name: reply.authorName,
                                  university: reply.authorUniversity,
                                })
                              }
                              className="font-semibold text-slate-900 dark:text-slate-200 hover:underline text-[11px]"
                            >
                              {reply.authorName}
                            </button>
                            <span className="text-[10px] text-slate-400">· {formatTimeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <Avatar name={currentUser.name} size="sm" />
          <div className="relative flex-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your thoughts or answer..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#17243A] dark:focus:border-slate-400 transition-colors"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="p-2 rounded-lg bg-[#17243A] text-white hover:bg-[#101827] dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0"
            aria-label="Submit comment"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-500 italic py-1">
          Please log in to participate in the discussion.
        </p>
      )}
    </div>
  );
};