import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postsService } from '../services/api';
import { Post, ReactionType } from '../types';
import { PostCard } from '../components/discussion/PostCard';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Saved: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const posts = await postsService.getSavedPosts();
      setSavedPosts(posts);
    } catch {
      showToast('Could not load saved discussions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      const result = await postsService.toggleReaction(postId, reactionType);
      setSavedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, reactions: result.reactions, userReaction: result.userReaction }
            : p
        )
      );
    } catch {
      showToast('Failed to react', 'error');
    }
  };

  const handleSave = async (postId: string) => {
    try {
      await postsService.toggleSavePost(postId);
      // Remove from saved list
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Removed from saved bookmarks', 'info');
    } catch {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!user) return;
    try {
      const comment = await postsService.addComment(postId, text, user);
      setSavedPosts((prev) =>
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
      showToast('Comment added', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Saved Discussions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Discussions and study guides you bookmarked for later review.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <PostCardSkeleton />
        </div>
      ) : savedPosts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved discussions"
          description="Click the bookmark icon on any discussion in the feed to save it here for quick access."
          actionLabel="Explore Feed"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="space-y-3.5">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onReact={handleReaction}
              onSave={handleSave}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
