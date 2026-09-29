export type University =
  | 'All'
  | 'UOG'
  | 'ILM'
  | 'Superior'
  | 'UOC'
  | 'Swedish'
  | 'UOP'
  | 'Other';

export const UNIVERSITIES: University[] = [
  'All',
  'UOG',
  'ILM',
  'Superior',
  'UOC',
  'Swedish',
  'UOP',
  'Other',
];

export const REGISTER_UNIVERSITIES: Exclude<University, 'All'>[] = [
  'UOG',
  'ILM',
  'Superior',
  'UOC',
  'Swedish',
  'UOP',
  'Other',
];

export type Category = 'All' | 'Admissions' | 'Course Review' | 'General';

export const CATEGORIES: Category[] = [
  'All',
  'Admissions',
  'Course Review',
  'General',
];

export const POST_CATEGORIES: Exclude<Category, 'All'>[] = [
  'Admissions',
  'Course Review',
  'General',
];

export type ReactionType =
  | 'Relatable'
  | 'Helpful'
  | 'Support'
  | 'Vibe';

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

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorUniversity: string;
  content: string;
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
  reactions?: Record<ReactionType, number>;
  userReaction?: ReactionType;
  replies?: CommentReply[];
}

export interface PublicProfile {
  id: string;
  name: string;
  university: string;
  batch?: string;
  bio?: string;
  avatarBg?: string;
  postCount?: number;
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
  reactions: Record<ReactionType, number>;
  commentCount: number;
  createdAt: string;
  comments: Comment[];
  userReaction?: ReactionType;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
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

export interface AppNotification {
  id: string;
  type: 'COMMENT' | 'LIKE' | 'MARKETPLACE' | 'SYSTEM';
  message: string;
  senderName?: string;
  postId?: string;
  marketplaceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FilterState {
  university: University;
  category: Category;
  marketplaceType?: 'all' | 'free' | 'paid';
}