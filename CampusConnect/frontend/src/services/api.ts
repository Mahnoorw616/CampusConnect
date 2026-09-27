import type { Post, MarketplaceItem, User, University, Category, Comment, ReactionType } from '../types';
import { INITIAL_POSTS, INITIAL_MARKETPLACE, INITIAL_USER } from './mockData';

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_BASE =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL ||
  'http://localhost:5000';

const STORAGE_KEYS = {
  USER: 'campuscrew_user',
  TOKEN: 'campuscrew_token',
  POSTS: 'campuscrew_posts',
  MARKETPLACE: 'campuscrew_marketplace',
  SAVED_POST_IDS: 'campuscrew_saved_post_ids',
};

// ─── Seed mock data (posts & marketplace only) ────────────────────────────────
function initializeStorage() {
  if (typeof window === 'undefined') return;

  // ---- migrate old post schema (upvotes → reactions) ----
  const rawPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (rawPosts) {
    try {
      const posts = JSON.parse(rawPosts) as Record<string, unknown>[];
      // If any post still has an 'upvotes' field, wipe and re-seed with new schema
      if (posts.length > 0 && 'upvotes' in posts[0]) {
        localStorage.removeItem(STORAGE_KEYS.POSTS);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.POSTS);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS)) {
    localStorage.setItem(STORAGE_KEYS.SAVED_POST_IDS, JSON.stringify(['post-1']));
  }
}
initializeStorage();

// ─── Delay helper (used by mocked posts/marketplace services) ─────────────────
const delay = (ms = 80) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message || `Request failed (${res.status})`
    );
  }
  return json as T;
}

// ─── Normalize backend User → frontend User ───────────────────────────────────
function normalizeUser(raw: Record<string, unknown>): User {
  const batchYear =
    typeof raw.batchYear === 'number' ? raw.batchYear : Number(raw.batchYear ?? new Date().getFullYear());
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    university: (raw.university as Exclude<University, 'All'>) ?? 'Other',
    batch: `Batch ${batchYear}`,
    whatsapp: String(raw.whatsappNumber ?? raw.whatsapp ?? ''),
    avatarBg: '#17243A',
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

// ─── Auth Service (real HTTP) ─────────────────────────────────────────────────
export const authService = {
  async getCurrentUser(): Promise<{ user: User | null; token: string | null }> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!token || !userStr) return { user: null, token: null };
    try {
      return { user: JSON.parse(userStr) as User, token };
    } catch {
      return { user: null, token: null };
    }
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const data = await apiRequest<{ token: string; user: Record<string, unknown> }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      const user = normalizeUser(data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, token: data.token };
    } catch (err) {
      // If server returned an authentication error (400/401), throw it
      if (err instanceof Error && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('Request failed')) {
        throw err;
      }
      // Offline / Demo mode fallback when backend is unreachable
      const nameFromEmail = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const fallbackUser: User = {
        ...INITIAL_USER,
        name: nameFromEmail || INITIAL_USER.name,
        email: email.trim() || INITIAL_USER.email,
      };
      const token = `demo_offline_token_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
      return { user: fallbackUser, token };
    }
  },

  async register(data: {
    name: string;
    email: string;
    university: Exclude<University, 'All'>;
    batch: string;
    whatsapp: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const batchYear =
      parseInt(data.batch.replace(/\D/g, ''), 10) || new Date().getFullYear();
    try {
      const res = await apiRequest<{ token: string; user: Record<string, unknown> }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
            university: data.university,
            batchYear,
            whatsappNumber: data.whatsapp.trim(),
          }),
        }
      );
      const user = normalizeUser(res.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, token: res.token };
    } catch (err) {
      // If server returned a validation error (400), throw it
      if (err instanceof Error && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('Request failed')) {
        throw err;
      }
      // Offline / Demo mode fallback
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim(),
        university: data.university,
        batch: `Batch ${batchYear}`,
        whatsapp: data.whatsapp.trim(),
        avatarBg: '#17243A',
        createdAt: new Date().toISOString(),
      };
      const token = `demo_offline_token_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
      return { user: fallbackUser, token };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};

// ─── Posts Service (mocked with localStorage) ─────────────────────────────────
export const postsService = {
  async getPosts(university?: University, category?: Category): Promise<Post[]> {
    await delay(60);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts: Post[] = raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;

    const savedIds: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]'
    ) as string[];
    posts = posts.map((p) => ({ ...p, isSaved: savedIds.includes(p.id) }));

    if (university && university !== 'All') {
      posts = posts.filter((p) => p.authorUniversity === university);
    }
    if (category && category !== 'All') {
      posts = posts.filter((p) => p.category === category);
    }
    return posts;
  },

  async getSavedPosts(): Promise<Post[]> {
    await delay(50);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;
    const savedIds: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]'
    ) as string[];
    return posts
      .filter((p) => savedIds.includes(p.id))
      .map((p) => ({ ...p, isSaved: true }));
  },

  async createPost(data: {
    title: string;
    content: string;
    category: Exclude<Category, 'All'>;
    university?: Exclude<University, 'All'>;
    mediaUrl?: string;
    user: User;
  }): Promise<Post> {
    await delay(100);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: data.user.id,
      authorName: data.user.name,
      authorUniversity: data.university ?? data.user.university,
      authorBatch: data.user.batch,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      reactions: { Relatable: 0, Helpful: 0, Support: 0, Vibe: 0 },
      commentCount: 0,
      createdAt: 'Just now',
      mediaUrl: data.mediaUrl,
      userReaction: undefined,
      isSaved: false,
      comments: [],
    };

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([newPost, ...posts]));
    return newPost;
  },

  async toggleReaction(
    postId: string,
    reactionType: ReactionType
  ): Promise<{ reactions: Record<ReactionType, number>; userReaction?: ReactionType }> {
    await delay(40);
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts: Post[] = raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;

    let result: { reactions: Record<ReactionType, number>; userReaction?: ReactionType } = {
      reactions: { Relatable: 0, Helpful: 0, Support: 0, Vibe: 0 },
      userReaction: undefined,
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isSame = p.userReaction === reactionType;
        const newReactions = { ...p.reactions };
        // Remove previous reaction count
        if (p.userReaction) newReactions[p.userReaction] = Math.max(0, newReactions[p.userReaction] - 1);
        // Add new reaction count (unless toggling off)
        if (!isSame) newReactions[reactionType] = (newReactions[reactionType] ?? 0) + 1;
        const newUserReaction = isSame ? undefined : reactionType;
        result = { reactions: newReactions, userReaction: newUserReaction };
        return { ...p, reactions: newReactions, userReaction: newUserReaction };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return result;
  },

  async toggleSavePost(postId: string): Promise<boolean> {
    await delay(30);
    const savedIds: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS) || '[]'
    ) as string[];
    let isSaved: boolean;
    if (savedIds.includes(postId)) {
      localStorage.setItem(
        STORAGE_KEYS.SAVED_POST_IDS,
        JSON.stringify(savedIds.filter((id) => id !== postId))
      );
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
    const posts: Post[] = raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;

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

// ─── Marketplace Service (mocked with localStorage) ───────────────────────────
export const marketplaceService = {
  async getListings(params?: {
    university?: University;
    type?: 'all' | 'free' | 'paid';
    courseQuery?: string;
  }): Promise<MarketplaceItem[]> {
    await delay(60);
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
    let items: MarketplaceItem[] = raw
      ? (JSON.parse(raw) as MarketplaceItem[])
      : INITIAL_MARKETPLACE;

    if (params?.university && params.university !== 'All') {
      items = items.filter((item) => item.university === params.university);
    }
    if (params?.type === 'free') {
      items = items.filter((item) => item.price === 0);
    } else if (params?.type === 'paid') {
      items = items.filter((item) => item.price > 0);
    }
    if (params?.courseQuery && params.courseQuery.trim()) {
      const q = params.courseQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
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
    const items: MarketplaceItem[] = raw
      ? (JSON.parse(raw) as MarketplaceItem[])
      : INITIAL_MARKETPLACE;

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

    localStorage.setItem(
      STORAGE_KEYS.MARKETPLACE,
      JSON.stringify([newItem, ...items])
    );
    return newItem;
  },

  async deleteListing(listingId: string): Promise<void> {
    await delay(50);
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
    const items: MarketplaceItem[] = raw
      ? (JSON.parse(raw) as MarketplaceItem[])
      : INITIAL_MARKETPLACE;
    localStorage.setItem(
      STORAGE_KEYS.MARKETPLACE,
      JSON.stringify(items.filter((i) => i.id !== listingId))
    );
  },
};
