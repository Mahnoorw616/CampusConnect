import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { marketplaceService } from '../services/api';
import { MarketplaceItem } from '../types';
import { MarketplaceCard } from '../components/marketplace/MarketplaceCard';
import { MarketplaceFilters } from '../components/marketplace/MarketplaceFilters';
import { MarketplaceCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ShoppingBag, Plus, BookOpen, ShieldCheck } from 'lucide-react';

interface OutletContextType {
  onOpenSellModal: () => void;
  onOpenListingDetail: (item: MarketplaceItem) => void;
}

export const Marketplace: React.FC = () => {
  const { user, selectedUniversity, setSelectedUniversity } = useAuth();
  const { showToast } = useToast();
  const { onOpenSellModal, onOpenListingDetail } = useOutletContext<OutletContextType>();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [courseQuery, setCourseQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = useCallback(async (
    showLoader = true,
    showError = true
  ) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const data = await marketplaceService.getListings({
        university: selectedUniversity,
        type: priceFilter,
        courseQuery,
      });
      setItems(data);
    } catch {
      if (showError) {
        showToast('Could not load study resources', 'error');
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [selectedUniversity, priceFilter, courseQuery, showToast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchListings(false, false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchListings]);

  useEffect(() => {
    const handleListingCreated = () => fetchListings();
    window.addEventListener('campuscrew:listing-created', handleListingCreated);
    return () => window.removeEventListener('campuscrew:listing-created', handleListingCreated);
  }, [fetchListings]);

  return (
    <div className="-mx-4 sm:-mx-6 -mt-6 p-4 sm:p-6 bg-[#EEF5F0]/50 dark:bg-[#0B1711]/60 min-h-[calc(100vh-4rem)] border-b border-[#D9E8DE]/60 dark:border-slate-800/80">
      {/* Marketplace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-[#D9E8DE] dark:border-[#1E3F2E]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#285943] text-white">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#193D2D] dark:text-[#91CEA9]">
              Campus Marketplace
            </h1>
          </div>
          <p className="text-xs text-[#20352A]/80 dark:text-slate-300">
            Find notes, books and study resources from students who have already taken the course.
          </p>
        </div>

        <button
          onClick={onOpenSellModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#285943] hover:bg-[#193D2D] transition-colors shadow-xs shrink-0 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>List Study Resource</span>
        </button>
      </div>

      {/* Trust Notice Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-[#112419] border border-[#D9E8DE] dark:border-[#1E3F2E] mb-5 text-xs text-[#20352A] dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#285943] dark:text-[#91CEA9] shrink-0" />
          <span>Peer-to-peer exchange. Direct WhatsApp contact with student sellers. No middleman fees.</span>
        </div>
        <span className="hidden md:inline font-semibold text-[#285943] dark:text-[#91CEA9]">
          100% Student Verified
        </span>
      </div>

      {/* Marketplace Filters */}
      <MarketplaceFilters
        selectedUniversity={selectedUniversity}
        onSelectUniversity={setSelectedUniversity}
        priceFilter={priceFilter}
        onSelectPriceFilter={setPriceFilter}
        courseQuery={courseQuery}
        onCourseQueryChange={setCourseQuery}
      />

      {/* Grid of Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MarketplaceCardSkeleton />
          <MarketplaceCardSkeleton />
          <MarketplaceCardSkeleton />
          <MarketplaceCardSkeleton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nothing here yet"
          description={
            selectedUniversity === 'All'
              ? 'No study resources match your filters. Be the first to share your notes!'
              : `No resources have been listed for ${selectedUniversity} yet.`
          }
          actionLabel="List a Resource"
          onAction={onOpenSellModal}
          variant="forest"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              onClick={onOpenListingDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};