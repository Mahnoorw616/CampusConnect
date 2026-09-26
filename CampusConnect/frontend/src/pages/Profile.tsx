import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { postsService, marketplaceService } from '../services/api';
import { Post, MarketplaceItem, User } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { PostCard } from '../components/discussion/PostCard';
import { MarketplaceCard } from '../components/marketplace/MarketplaceCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ShoppingBag,
  Moon,
  Sun,
  LogOut,
  Trash2,
  Phone,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface OutletContextType {
  onOpenListingDetail: (item: MarketplaceItem) => void;
}

export const Profile: React.FC = () => {
  const { user, logout, setDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { onOpenListingDetail } = useOutletContext<OutletContextType>();

  const [activeTab, setActiveTab] = useState<'posts' | 'marketplace'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userListings, setUserListings] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const allPosts = await postsService.getPosts();
        setUserPosts(allPosts.filter((p) => p.authorId === user.id || p.authorName === user.name));

        const allListings = await marketplaceService.getListings();
        setUserListings(allListings.filter((i) => i.sellerId === user.id || i.sellerName === user.name));
      } catch {
        showToast('Could not load profile records', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, showToast]);

  const handleDeleteListing = async (listingId: string) => {
    try {
      await marketplaceService.deleteListing(listingId);
      setUserListings((prev) => prev.filter((i) => i.id !== listingId));
      showToast('Listing removed from marketplace', 'info');
      window.dispatchEvent(new CustomEvent('campuscrew:listing-created'));
    } catch {
      showToast('Failed to delete listing', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500 mb-4">You are not logged in.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-[#17243A] text-white rounded-lg text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Profile Summary Card */}
      <div className="bg-white dark:bg-[#131D31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="xl" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-[#17243A] dark:text-slate-200">
                  {user.university} Islamabad
                </span>
                <span>·</span>
                <span>{user.batch}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp: +{user.whatsapp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-medium border border-rose-200/60 dark:border-rose-900/60 flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {userPosts.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Campus Discussions
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#EEF5F0]/70 dark:bg-[#11271D]/60 border border-[#D9E8DE]/70 dark:border-[#1F4432]">
            <div className="text-2xl font-bold text-[#193D2D] dark:text-[#91CEA9] tabular-nums">
              {userListings.length}
            </div>
            <div className="text-xs text-[#20352A]/80 dark:text-slate-300 mt-0.5">
              Study Resources Listed
            </div>
          </div>
        </div>

        {/* Switch Demo Student Persona Helper */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Switch Demo Student:
          </span>
          <button
            onClick={() =>
              setDemoUser({
                id: 'user-ahmed-1',
                name: 'Ahmed Khan',
                email: 'ahmed.khan@isb.nu.edu.pk',
                university: 'FAST',
                batch: 'Batch 2026',
                whatsapp: '923005551234',
                createdAt: '2025-09-10T10:00:00Z',
              })
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              user.university === 'FAST'
                ? 'bg-[#17243A] text-white border-slate-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Ahmed (FAST)
          </button>
          <button
            onClick={() =>
              setDemoUser({
                id: 'user-5',
                name: 'Zainab Shah',
                email: 'zainab.shah@seecs.nust.edu.pk',
                university: 'NUST',
                batch: 'Batch 2025',
                whatsapp: '923129876543',
                createdAt: '2025-09-12T10:00:00Z',
              })
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              user.university === 'NUST'
                ? 'bg-[#17243A] text-white border-slate-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Zainab (NUST)
          </button>
          <button
            onClick={() =>
              setDemoUser({
                id: 'user-8',
                name: 'Muneeb Arshad',
                email: 'muneeb@comsats.edu.pk',
                university: 'COMSATS',
                batch: 'Batch 2026',
                whatsapp: '923334567890',
                createdAt: '2025-09-15T10:00:00Z',
              })
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              user.university === 'COMSATS'
                ? 'bg-[#17243A] text-white border-slate-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Muneeb (COMSATS)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'posts'
              ? 'border-[#17243A] text-[#17243A] dark:border-slate-200 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Discussions ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'marketplace'
              ? 'border-[#285943] text-[#285943] dark:border-[#91CEA9] dark:text-[#91CEA9]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Listed Resources ({userListings.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        userPosts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No discussions started yet"
            description="Got a question or insight? Post to your campus community."
          />
        ) : (
          <div className="space-y-3.5">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onUpvote={async () => {}}
                onSave={async () => {}}
                onAddComment={async () => {}}
              />
            ))}
          </div>
        )
      ) : userListings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No study resources listed yet"
          description="Have old lecture notes, midterm guides, or textbooks? List them to help juniors."
          variant="forest"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userListings.map((item) => (
            <div key={item.id} className="relative group">
              <MarketplaceCard item={item} onClick={onOpenListingDetail} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteListing(item.id);
                }}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-rose-600 hover:bg-rose-50 shadow-md border border-slate-200 dark:border-slate-700 transition-colors"
                title="Delete this listing"
                aria-label="Delete listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
