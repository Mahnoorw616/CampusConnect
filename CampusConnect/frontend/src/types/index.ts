export type University = 'All' | 'FAST' | 'NUST' | 'COMSATS' | 'Bahria' | 'Air' | 'Other';

export const UNIVERSITIES: University[] = ['All', 'FAST', 'NUST', 'COMSATS', 'Bahria', 'Air', 'Other'];
export const REGISTER_UNIVERSITIES: Exclude<University, 'All'>[] = ['FAST', 'NUST', 'COMSATS', 'Bahria', 'Air', 'Other'];

export type Category = 'All' | 'Admissions' | 'Course Review' | 'General';
export const CATEGORIES: Category[] = ['All', 'Admissions', 'Course Review', 'General'];
export const POST_CATEGORIES: Exclude<Category, 'All'>[] = ['Admissions', 'Course Review', 'General'];

export interface User {
  id: string;
  name: string;
  email: string;
  university: Exclude<University, 'All'>;
  batch: string;
  whatsapp: string;
  avatarBg?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUniversity: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUniversity: Exclude<University, 'All'>;
  authorBatch: string;
  title: string;
  content: string;
  category: Exclude<Category, 'All'>;
  upvotes: number;
  commentCount: number;
  createdAt: string;
  comments: Comment[];
  hasUpvoted?: boolean;
  isSaved?: boolean;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp: string;
  title: string;
  courseName: string;
  courseCode: string;
  university: Exclude<University, 'All'>;
  price: number;
  description: string;
  driveLink?: string;
  coverImage?: string;
  createdAt: string;
}

export interface FilterState {
  university: University;
  category: Category;
  marketplaceType?: 'all' | 'free' | 'paid';
}
