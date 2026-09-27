import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { CreatePostModal } from '../discussion/CreatePostModal';
import { SellListingModal } from '../marketplace/SellListingModal';
import { ListingDetailModal } from '../marketplace/ListingDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postsService, marketplaceService } from '../../services/api';
import { Post, MarketplaceItem, Category, University } from '../../types';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceItem | null>(null);

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [marketplaceHighlights, setMarketplaceHighlights] = useState<MarketplaceItem[]>([]);

  // Load right sidebar highlights
  const refreshHighlights = async () => {
    try {
      const posts = await postsService.getPosts();
      setTrendingPosts(posts.slice(0, 3));
      const market = await marketplaceService.getListings();
      setMarketplaceHighlights(market.slice(0, 3));
    } catch {
      // quiet fallback
    }
  };

  useEffect(() => {
    refreshHighlights();

    const intervalId = window.setInterval(() => {
      refreshHighlights();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleCreatePost = async (data: {
    title: string;
    content: string;
    category: Exclude<Category, 'All'>;
    university: Exclude<University, 'All'>;
    mediaUrl?: string;
  }) => {
    if (!user) return;
    try {
      await postsService.createPost({
        ...data,
        user,
      });
      showToast('Discussion published to campus feed', 'success');
      refreshHighlights();
      // Notify active pages to re-fetch if needed
      window.dispatchEvent(new CustomEvent('campuscrew:post-created'));
    } catch {
      showToast('Failed to post discussion', 'error');
    }
  };

  const handleCreateListing = async (data: {
    title: string;
    courseName: string;
    courseCode: string;
    price: number;
    university: Exclude<University, 'All'>;
    description: string;
    driveLink?: string;
    coverImage?: string;
  }) => {
    if (!user) return;
    try {
      await marketplaceService.createListing(data, user);
      showToast('Study resource listed successfully', 'success');
      refreshHighlights();
      window.dispatchEvent(new CustomEvent('campuscrew:listing-created'));
    } catch {
      showToast('Failed to list resource', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B111E] text-[#18202B] dark:text-[#E2E8F0] flex flex-col antialiased">
      {/* Mobile Top App Bar */}
      <div className="lg:hidden">
        <Navbar onOpenCreatePost={() => setIsCreatePostOpen(true)} />
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto justify-center">
        {/* Left Desktop Sidebar */}
        <Sidebar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          onOpenSellModal={() => setIsSellModalOpen(true)}
        />

        {/* Center Main Content Container */}
        <main className="flex-1 max-w-2xl min-w-0 px-4 sm:px-6 py-6 pb-24 lg:pb-8">
          <Outlet
            context={{
              onOpenCreatePost: () => setIsCreatePostOpen(true),
              onOpenSellModal: () => setIsSellModalOpen(true),
              onOpenListingDetail: (item: MarketplaceItem) => setSelectedListing(item),
            }}
          />
        </main>

        {/* Right Desktop Contextual Sidebar */}
        <RightSidebar
          trendingPosts={trendingPosts}
          marketplaceHighlights={marketplaceHighlights}
          onSelectMarketplace={(item) => setSelectedListing(item)}
        />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      {user && (
        <>
          <CreatePostModal
            isOpen={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
            onSubmit={handleCreatePost}
            currentUser={user}
          />

          <SellListingModal
            isOpen={isSellModalOpen}
            onClose={() => setIsSellModalOpen(false)}
            onSubmit={handleCreateListing}
            currentUser={user}
          />
        </>
      )}

      {/* Marketplace Detail Modal */}
      <ListingDetailModal
        item={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
};