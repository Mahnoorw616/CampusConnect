import React, { useState, useRef } from 'react';
import { University, REGISTER_UNIVERSITIES, User } from '../../types';
import { X, Upload } from 'lucide-react';

interface SellListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    courseName: string;
    courseCode: string;
    price: number;
    university: Exclude<University, 'All'>;
    description: string;
    driveLink?: string;
    coverImage?: string;
  }) => Promise<void>;
  currentUser: User;
}

export const SellListingModal: React.FC<SellListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number | ''>('');
  const [university, setUniversity] = useState<Exclude<University, 'All'>>(
    currentUser.university || 'FAST'
  );
  const [description, setDescription] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target?.result as string);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCoverImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a listing title.');
      return;
    }
    if (!courseName.trim()) {
      setError('Please provide the course name.');
      return;
    }
    if (!courseCode.trim()) {
      setError('Please provide the course code (e.g., CS201).');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your study material.');
      return;
    }

    const calculatedPrice = isFree ? 0 : Number(price) || 0;
    if (!isFree && calculatedPrice <= 0) {
      setError('Please enter a valid price in PKR, or mark as Free.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        price: calculatedPrice,
        university,
        description: description.trim(),
        driveLink: driveLink.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
      });

      // Reset
      setTitle('');
      setCourseName('');
      setCourseCode('');
      setPrice('');
      setIsFree(true);
      setDescription('');
      setDriveLink('');
      removeCoverImage();
      onClose();
    } catch {
      setError('Failed to publish listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-modal-title"
    >
      <div className="bg-white dark:bg-[#131D31] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="sell-modal-title" className="text-base font-semibold text-[#193D2D] dark:text-[#88C6A5]">
              List Study Resource
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Share your notes or resources with students who might need them.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculus I Handwritten Notes + Solved Midterms"
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#285943]"
            />
          </div>

          {/* Course Details & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. MTH101"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 uppercase"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Calculus & Analytical Geo"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campus *
              </label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value as Exclude<University, 'All'>)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {REGISTER_UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price selection */}
          <div className="p-3.5 rounded-xl bg-[#EEF5F0]/60 dark:bg-[#0E2319]/40 border border-[#D9E8DE]/80 dark:border-[#1E432F] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Give away for Free (Gift to campus peers)?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFree(!isFree);
                  if (!isFree) setPrice('');
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isFree ? 'bg-[#285943]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-pressed={isFree}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isFree ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {!isFree && (
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Asking Price in PKR (Rs.)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description & Condition *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention if it includes midterm solutions, handwritten notes, printed binder, or physical book edition..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#285943] resize-none"
            />
          </div>

          {/* Google Drive Link */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Google Drive / Download Link (Optional for digital notes)
            </label>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Cover Picture Upload */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resource Picture / Cover Photo (Optional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group max-h-48 flex items-center justify-center">
                <img src={coverImage} alt="Resource cover preview" className="max-h-48 w-full object-contain" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  title="Remove picture"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#D9E8DE] dark:border-slate-700 hover:border-[#285943] dark:hover:border-[#88C6A5] rounded-xl p-3.5 text-center transition-colors flex flex-col items-center justify-center gap-1 group bg-[#EEF5F0]/40 dark:bg-slate-800/40"
              >
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#285943] dark:text-[#88C6A5] group-hover:bg-[#285943] group-hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Click to upload a picture of your notes or textbook
                </div>
                <div className="text-[10px] text-slate-400">
                  Supports PNG, JPG, WEBP (Max 10MB)
                </div>
              </button>
            )}
          </div>

          {/* Notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
            Your WhatsApp number (<span className="font-semibold">{currentUser.whatsapp}</span>) will be used so interested students can reach you directly.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !courseName.trim()}
              className="px-5 py-2 text-xs font-medium text-white bg-[#285943] hover:bg-[#193D2D] rounded-lg transition-colors disabled:opacity-50 min-h-[40px]"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
