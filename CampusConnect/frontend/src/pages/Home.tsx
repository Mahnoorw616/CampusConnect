import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postsService } from '../services/api';
import { Post, University } from '../types';
import { PostCard } from '../components/discussion/PostCard';
import { UniversityFilter } from '../components/discussion/UniversityFilter';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

import feedLogo from '../assets/images/Feed_Logo.png';

interface OutletContextType {
  onOpenCreatePost: () => void;
  onOpenSellModal: () => void;
}

export const Home: React.FC = () => {
  const { user, selectedUniversity, setSelectedUniversity } = useAuth();
  const { showToast } = useToast();
  const { onOpenCreatePost } = useOutletContext<OutletContextType>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await postsService.getPosts(selectedUniversity);
      setPosts(data);
    } catch {
      showToast('Could not load campus feed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUniversity, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for newly created posts from global layout modal
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts();
    };
    window.addEventListener('campuscrew:post-created', handlePostCreated);
    return () => window.removeEventListener('campuscrew:post-created', handlePostCreated);
  }, [fetchPosts]);

  const handleUpvote = async (postId: string) => {
    try {
      const result = await postsService.toggleUpvote(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, upvotes: result.upvotes, hasUpvoted: result.hasUpvoted }
            : p
        )
      );
    } catch {
      showToast('Failed to register upvote', 'error');
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const isSaved = await postsService.toggleSavePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved } : p))
      );
      showToast(isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch {
      showToast('Could not save post', 'error');
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!user) return;
    try {
      const comment = await postsService.addComment(postId, text, user);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              commentCount: p.commentCount + 1,
              comments: [...(p.comments || []), comment],
            }
            : p
        )
      );
      showToast('Comment published', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  return (
    <div>
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5">
          <img
            src={feedLogo}
            alt="Campus Feed Logo"
            className="w-18 h-18 sm:w-16 sm:h-16 object-contain rounded-xl shadow-xs"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Campus Feed
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real questions, course reviews, and campus life in Islamabad & Rawalpindi.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs shrink-0 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* University Filter Bar */}
      <div className="mb-4">
        <UniversityFilter
          selectedUniversity={selectedUniversity}
          onSelectUniversity={setSelectedUniversity}
        />
      </div>

      {/* Interactive Quick Post Trigger */}
      {user && (
        <div
          onClick={onOpenCreatePost}
          className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 mb-5 flex items-center gap-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
        >
          <Avatar name={user.name} size="sm" />
          <div className="flex-1 text-xs text-slate-400 dark:text-slate-500">
            Got a question about courses, electives, or campus life?
          </div>
          <span className="text-xs font-semibold text-[#17243A] dark:text-slate-200 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            Post
          </span>
        </div>
      )}

      {/* Feed List */}
      {isLoading ? (
        <div className="space-y-3">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description={
            selectedUniversity === 'All'
              ? 'Be the first student to start the conversation on CampusCrew.'
              : `No discussions yet for ${selectedUniversity} Islamabad. Be the first to start!`
          }
          actionLabel="Create Discussion"
          onAction={onOpenCreatePost}
        />
      ) : (
        <div className="space-y-3.5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onUpvote={handleUpvote}
              onSave={handleSave}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
