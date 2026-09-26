import React, { useState } from 'react';
import { Comment, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  currentUser: User | null;
  onAddComment: (postId: string, text: string) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  currentUser,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 space-y-4">
      {/* Existing comments list */}
      <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
            No comments yet. Be the first student to respond!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
            >
              <Avatar name={comment.authorName} size="sm" />
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {comment.authorName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{comment.authorUniversity}</span>
                    <span>·</span>
                    <span>{comment.createdAt}</span>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
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
