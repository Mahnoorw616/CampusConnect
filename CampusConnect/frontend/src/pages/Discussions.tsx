import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postsService } from '../services/api';
import { Post, Category, CATEGORIES, ReactionType, Comment as PostComment, PublicProfile } from '../types';
import { PostCard } from '../components/discussion/PostCard';
import { UniversityFilter } from '../components/discussion/UniversityFilter';
import { PublicProfileModal } from '../components/profile/PublicProfileModal';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { MessageSquare, Plus } from 'lucide-react';

interface OutletContextType {
  onOpenCreatePost: () => void;
}

export const Discussions: React.FC = () => {
  const { user, selectedUniversity, setSelectedUniversity } = useAuth();
  const { showToast } = useToast();
  const { onOpenCreatePost } = useOutletContext<OutletContextType>();
  const [searchParams] = useSearchParams();
  const linkedPostId = searchParams.get('post');

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Profile modal state
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);

  const fetchPosts = useCallback(async (
    showLoader = true,
    showError = true
  ) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const data = await postsService.getPosts(selectedUniversity, selectedCategory);
      setPosts(data);
    } catch {
      if (showError) {
        showToast('Could not load discussions', 'error');
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [selectedUniversity, selectedCategory, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!linkedPostId || isLoading) return;
    document.getElementById(`post-${linkedPostId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [linkedPostId, posts, isLoading]);

  useEffect(() => {
    if (linkedPostId) {
      setSelectedUniversity('All');
      setSelectedCategory('All');
    }
  }, [linkedPostId, setSelectedUniversity]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchPosts(false, false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchPosts]);

  useEffect(() => {
    const handlePostCreated = () => fetchPosts();
    window.addEventListener('campuscrew:post-created', handlePostCreated);
    return () => window.removeEventListener('campuscrew:post-created', handlePostCreated);
  }, [fetchPosts]);

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isSame = targetPost.userReaction === reactionType;
    const newReactions = { ...targetPost.reactions };

    if (targetPost.userReaction && newReactions[targetPost.userReaction] !== undefined) {
      newReactions[targetPost.userReaction] = Math.max(0, newReactions[targetPost.userReaction] - 1);
    }
    if (!isSame) {
      newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
    }
    const newUserReaction = isSame ? undefined : reactionType;

    // ⚡ Instant DOM update (0ms UI latency)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, reactions: newReactions, userReaction: newUserReaction }
          : p
      )
    );

    try {
      const result = await postsService.toggleReaction(postId, reactionType, targetPost);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, reactions: result.reactions, userReaction: result.userReaction }
            : p
        )
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? targetPost : p))
      );
      showToast('Failed to react', 'error');
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
      showToast('Failed to save post', 'error');
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!user) return;

    const optimisticComment: PostComment = {
      id: `temp-${Date.now()}`,
      postId,
      authorId: user.id,
      authorName: user.name,
      authorUniversity: user.university,
      content: text,
      createdAt: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            commentCount: p.commentCount + 1,
            comments: [...(p.comments || []), optimisticComment],
          }
          : p
      )
    );

    try {
      const realComment = await postsService.addComment(postId, text, user);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === optimisticComment.id ? realComment : c
              ),
            }
            : p
        )
      );
      showToast('Comment added', 'success');
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              commentCount: Math.max(0, p.commentCount - 1),
              comments: (p.comments || []).filter((c) => c.id !== optimisticComment.id),
            }
            : p
        )
      );
      showToast('Failed to add comment', 'error');
    }
  };

  const handleEditPost = async (
    postId: string,
    data: { title?: string; content?: string }
  ) => {
    try {
      const updatedPost = await postsService.updatePost(postId, data);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      showToast('Post updated successfully', 'success');
    } catch {
      showToast('Failed to update post', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Post deleted', 'info');
    } catch {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleEditComment = async (postId: string, commentId: string, text: string) => {
    try {
      const updatedPost = await postsService.updateComment(postId, commentId, text);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      showToast('Comment updated', 'success');
    } catch {
      showToast('Failed to edit comment', 'error');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const updatedPost = await postsService.deleteComment(postId, commentId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      showToast('Comment deleted', 'info');
    } catch {
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleCommentReaction = async (
    postId: string,
    commentId: string,
    reactionType: ReactionType
  ) => {
    try {
      const res = await postsService.toggleCommentReaction(postId, commentId, reactionType);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: (p.comments || []).map((c) =>
              c.id === commentId
                ? { ...c, reactions: res.reactions, userReaction: res.userReaction }
                : c
            ),
          };
        })
      );
    } catch {
      showToast('Failed to react to comment', 'error');
    }
  };

  const handleCommentReply = async (postId: string, commentId: string, text: string) => {
    try {
      const updatedPost = await postsService.addCommentReply(postId, commentId, text);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      showToast('Reply added', 'success');
    } catch {
      showToast('Failed to reply', 'error');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Discussions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Filter conversations by topic, department, and university.
          </p>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#17243A] hover:bg-[#101827] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs shrink-0 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* University Filters */}
      <div className="mb-3">
        <UniversityFilter
          selectedUniversity={selectedUniversity}
          onSelectUniversity={setSelectedUniversity}
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2">
        <span className="text-xs font-medium text-slate-400 mr-1 shrink-0">Category:</span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-md transition-colors min-h-[32px] ${isSelected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#131D31] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions found"
          description="Try selecting a different campus or topic category."
          actionLabel="Start a Discussion"
          onAction={onOpenCreatePost}
        />
      ) : (
        <div className="space-y-3.5">
          {posts.map((post) => (
            <div key={post.id} id={`post-${post.id}`} className={linkedPostId === post.id ? 'scroll-mt-24 rounded-xl ring-2 ring-sky-400/60' : 'scroll-mt-24'}>
            <PostCard
              post={post}
              currentUser={user}
              onReact={handleReaction}
              onSave={handleSave}
              onAddComment={handleAddComment}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onCommentReaction={handleCommentReaction}
              onCommentReply={handleCommentReply}
              onViewProfile={(profile) => setSelectedProfile(profile)}
            />
            </div>
          ))}
        </div>
      )}

      {/* Public Profile Modal */}
      <PublicProfileModal
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
};