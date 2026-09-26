import React, { useState } from 'react';
import { Post, User } from '../../types';
import { formatTimeAgo } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { CommentSection } from './CommentSection';
import { ArrowBigUp, MessageSquare, Bookmark } from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onUpvote: (postId: string) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onAddComment: (postId: string, text: string) => Promise<void>;
  highlightCategory?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onUpvote,
  onSave,
  onAddComment,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      await onUpvote(post.id);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(post.id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-3.5 transition-shadow hover:shadow-xs">
      {/* Header: Author Info & Category */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={post.authorName} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {post.authorName}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-medium text-[#17243A] dark:text-slate-300">
                {post.authorUniversity}
              </span>
              <span>·</span>
              <span>{post.authorBatch}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <Badge variant="category">{post.category}</Badge>
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${post.isSaved ? 'text-[#17243A] dark:text-slate-200 fill-current' : ''
              }`}
            title={post.isSaved ? 'Saved to bookmarks' : 'Save post'}
            aria-label={post.isSaved ? 'Remove from saved' : 'Save discussion'}
          >
            <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <h3 className="text-base sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug tracking-tight">
        {post.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {/* Actions: Upvote, Comment count trigger */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${post.hasUpvoted
                ? 'bg-[#17243A] text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            aria-label={`Upvote discussion, currently ${post.upvotes} upvotes`}
          >
            <ArrowBigUp
              className={`w-4 h-4 ${post.hasUpvoted ? 'fill-current' : ''}`}
            />
            <span className="tabular-nums">{post.upvotes}</span>
          </button>

          {/* Comment button */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${showComments
                ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            aria-expanded={showComments}
            aria-label={`${post.commentCount} comments, click to ${showComments ? 'collapse' : 'expand'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          {post.authorUniversity} Community
        </span>
      </div>

      {/* Expandable comments drawer */}
      {showComments && (
        <CommentSection
          comments={post.comments || []}
          postId={post.id}
          currentUser={currentUser}
          onAddComment={onAddComment}
        />
      )}
    </article>
  );
};