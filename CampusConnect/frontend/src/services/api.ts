import { Post, MarketplaceItem, User, University, Category, Comment } from '../types';
import { INITIAL_POSTS, INITIAL_MARKETPLACE, INITIAL_USER } from './mockData';

const STORAGE_KEYS = {
  USER: 'campuscrew_user',
  TOKEN: 'campuscrew_token',
  POSTS: 'campuscrew_posts',
  MARKETPLACE: 'campuscrew_marketplace',
  SAVED_POST_IDS: 'campuscrew_saved_post_ids',
};

// Initialize localStorage with realistic seed data if not present
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_token_campuscrew_demo');
  }

  if (!localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS)) {
    localStorage.setItem(STORAGE_KEYS.SAVED_POST_IDS, JSON.stringify(['post-1']));
  }
}

initializeStorage();

// Delay helper to mimic realistic async backend response
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async getCurrentUser(): Promise<{ user: User | null; token: string | null }> {
    await delay(30);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!userStr || !token) {
      return { user: null, token: null };
    }
    try {
      return { user: JSON.parse(userStr), token };
    } catch {
      return { user: null, token: null };
    }
  },

  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(120);
    // Find existing or fallback to realistic student
    const existingStr = localStorage.getItem(STORAGE_KEYS.USER);
    let user: User = INITIAL_USER;
    if (existingStr) {
      try {
        const parsed = JSON.parse(existingStr);
        if (parsed.email === email) user = parsed;
      } catch {
        // fallback
      }
    }
    const token = `jwt_token_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    return { user, token };
  },

  async register(data: {
    name: string;
    email: string;
    university: Exclude<University, 'All'>;
    batch: string;
    whatsapp: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    await delay(150);
    // Clean whatsapp number
    const cleanWhatsapp = data.whatsapp.replace(/\D/g, '');
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      university: data.university,
      batch: data.batch.trim() || 'Batch 2026',
      whatsapp: cleanWhatsapp || '923001234567',
      avatarBg: '#17243A',
      createdAt: new Date().toISOString(),
    };
    const token = `jwt_token_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    return { user: newUser, token };
  },

  async logout(): Promise<void> {
    await delay(40);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};

export const postsService = {
  async getPosts(university?: University, category?: Category): Promise<Post[]> {
    await delay(60);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts: Post[] = raw ? JSON.parse(raw) : INITIAL_POSTS;
    
    // Check saved status
    const savedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]');
    posts = posts.map(p => ({
      ...p,
      isSaved: savedIds.includes(p.id)
    }));

    if (university && university !== 'All') {
      posts = posts.filter(p => p.authorUniversity === university);
    }

    if (category && category !== 'All') {
      posts = posts.filter(p => p.category === category);
    }

    return posts;
  },

  async getSavedPosts(): Promise<Post[]> {
    await delay(50);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : INITIAL_POSTS;
    const savedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]');
    return posts.filter(p => savedIds.includes(p.id)).map(p => ({ ...p, isSaved: true }));
  },

  async createPost(data: {
    title: string;
    content: string;
    category: Exclude<Category, 'All'>;
    university?: Exclude<University, 'All'>;
    user: User;
  }): Promise<Post> {
    await delay(100);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: data.user.id,
      authorName: data.user.name,
      authorUniversity: data.university || data.user.university,
      authorBatch: data.user.batch,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      upvotes: 1,
      commentCount: 0,
      createdAt: 'Just now',
      hasUpvoted: true,
      isSaved: false,
      comments: [],
    };

    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return newPost;
  },

  async toggleUpvote(postId: string): Promise<{ upvotes: number; hasUpvoted: boolean }> {
    await delay(40);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    let result = { upvotes: 0, hasUpvoted: false };
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const currentlyUpvoted = !!p.hasUpvoted;
        const newUpvotes = currentlyUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1;
        result = { upvotes: newUpvotes, hasUpvoted: !currentlyUpvoted };
        return {
          ...p,
          upvotes: newUpvotes,
          hasUpvoted: !currentlyUpvoted,
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return result;
  },

  async toggleSavePost(postId: string): Promise<boolean> {
    await delay(30);
    const savedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]');
    let isSaved: boolean;
    if (savedIds.includes(postId)) {
      const next = savedIds.filter(id => id !== postId);
      localStorage.setItem(STORAGE_KEYS.SAVED_POST_IDS, JSON.stringify(next));
      isSaved = false;
    } else {
      savedIds.push(postId);
      localStorage.setItem(STORAGE_KEYS.SAVED_POST_IDS, JSON.stringify(savedIds));
      isSaved = true;
    }
    return isSaved;
  },

  async addComment(postId: string, content: string, user: User): Promise<Comment> {
    await delay(60);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      authorId: user.id,
      authorName: user.name,
      authorUniversity: user.university,
      content: content.trim(),
      createdAt: 'Just now',
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          commentCount: (p.commentCount || 0) + 1,
          comments: [...(p.comments || []), newComment],
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return newComment;
  },
};

export const marketplaceService = {
  async getListings(params?: {
    university?: University;
    type?: 'all' | 'free' | 'paid';
    courseQuery?: string;
  }): Promise<MarketplaceItem[]> {
    await delay(60);
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
    let items: MarketplaceItem[] = raw ? JSON.parse(raw) : INITIAL_MARKETPLACE;

    if (params?.university && params.university !== 'All') {
      items = items.filter(item => item.university === params.university);
    }

    if (params?.type === 'free') {
      items = items.filter(item => item.price === 0);
    } else if (params?.type === 'paid') {
      items = items.filter(item => item.price > 0);
    }

    if (params?.courseQuery && params.courseQuery.trim()) {
      const q = params.courseQuery.toLowerCase().trim();
      items = items.filter(
        item =>
          item.courseName.toLowerCase().includes(q) ||
          item.courseCode.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q)
      );
    }

    return items;
  },

  async createListing(
    data: {
      title: string;
      courseName: string;
      courseCode: string;
      price: number;
      university: Exclude<University, 'All'>;
      description: string;
      driveLink?: string;
      coverImage?: string;
    },
    user: User
  ): Promise<MarketplaceItem> {
    await delay(120);
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
    const items: MarketplaceItem[] = raw ? JSON.parse(raw) : INITIAL_MARKETPLACE;

    const newItem: MarketplaceItem = {
      id: `market-${Date.now()}`,
      sellerId: user.id,
      sellerName: user.name,
      sellerWhatsapp: user.whatsapp,
      title: data.title.trim(),
      courseName: data.courseName.trim(),
      courseCode: data.courseCode.trim().toUpperCase(),
      price: Math.max(0, Number(data.price) || 0),
      university: data.university,
      description: data.description.trim(),
      driveLink: data.driveLink?.trim() || undefined,
      coverImage: data.coverImage?.trim() || undefined,
      createdAt: 'Just now',
    };

    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(updated));
    return newItem;
  },

  async deleteListing(listingId: string): Promise<void> {
    await delay(50);
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
    const items: MarketplaceItem[] = raw ? JSON.parse(raw) : INITIAL_MARKETPLACE;
    const filtered = items.filter(i => i.id !== listingId);
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(filtered));
  },
};
