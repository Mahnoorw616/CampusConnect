import React from 'react';
import { X, GraduationCap, Calendar, Sparkles } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { PublicProfile } from '../../types';

interface PublicProfileModalProps {
  profile: PublicProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !profile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#131D31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Banner */}
        <div className="h-24 bg-gradient-to-r from-[#17243A] via-[#1E3A5F] to-[#285943] relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar + Badge row */}
          <div className="flex justify-between items-end -mt-9 mb-4">
            <Avatar name={profile.name} size="xl" />
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Student
            </span>
          </div>

          {/* Name & University */}
          <div className="space-y-1 mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {profile.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-[#17243A] dark:text-slate-300">
                <GraduationCap className="w-4 h-4" />
                {profile.university}
              </span>
              {profile.batch && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {profile.batch}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 mb-5">
            {profile.bio || `Active member of the ${profile.university} student community on CampusConnect.`}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium text-sm transition-colors text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
