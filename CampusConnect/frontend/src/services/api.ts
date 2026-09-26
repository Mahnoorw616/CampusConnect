import type {
  Category,
  Comment,
  MarketplaceItem,
  Post,
  University,
  User,
} from '../types';
import { INITIAL_MARKETPLACE, INITIAL_POSTS } from './mockData';

type ApiRecord = Record<string, unknown>;

const runtimeEnv = (import.meta as unknown as {
  env?: Record<string, string | undefined>;
}).env ?? {};

const defaultApiBase =
  typeof window === 'undefined'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

const API_BASE = (
  runtimeEnv.VITE_API_BASE_URL || defaultApiBase
).replace(/\/+$/, '');

type DataMode = 'api' | 'mock' | 'hybrid';

const configuredDataMode = runtimeEnv.VITE_DATA_MODE;
const DATA_MODE: DataMode =
  configuredDataMode === 'mock' ||
    configuredDataMode === 'hybrid'
    ? configuredDataMode
    : 'api';

const STORAGE_KEYS = {
  USER: 'campuscrew_user',
  TOKEN: 'campuscrew_token',
  POSTS: 'campuscrew_posts',
  MARKETPLACE: 'campuscrew_marketplace',
  SAVED_POST_IDS: 'campuscrew_saved_post_ids',
};

const initializeMockStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(
      STORAGE_KEYS.POSTS,
      JSON.stringify(INITIAL_POSTS)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
    localStorage.setItem(
      STORAGE_KEYS.MARKETPLACE,
      JSON.stringify(INITIAL_MARKETPLACE)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.SAVED_POST_IDS)) {
    localStorage.setItem(
      STORAGE_KEYS.SAVED_POST_IDS,
      JSON.stringify(['post-1'])
    );
  }
};

initializeMockStorage();

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const CATEGORY_VALUES: Exclude<Category, 'All'>[] = [
  'Admissions',
  'Course Review',
  'General',
];

const UNIVERSITY_VALUES: Exclude<University, 'All'>[] = [
  'FAST',
  'NUST',
  'COMSATS',
  'Bahria',
  'Air',
  'Other',
];

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const formatTimeAgo = (value: string) => {
  if (!value) return 'Just now';

  const date = new Date(value);

  // Mock data may already contain display text such as "2 hours ago".
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === 'object'
    ? (value as ApiRecord)
    : {};

const asString = (value: unknown, fallback = '') =>
  value === undefined || value === null
    ? fallback
    : String(value);

const asNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getObjectId = (value: unknown) => {
  const record = asRecord(value);
  return String(record._id ?? record.id ?? value ?? '');
};

const normalizeUser = (value: unknown): User => {
  const raw = asRecord(value);
  const batchYear = asNumber(
    raw.batchYear,
    new Date().getFullYear()
  );

  const university = UNIVERSITY_VALUES.includes(
    raw.university as Exclude<University, 'All'>
  )
    ? (raw.university as Exclude<University, 'All'>)
    : 'Other';

  return {
    id: getObjectId(raw),
    name: asString(raw.name),
    email: asString(raw.email),
    university,
    batch: `Batch ${batchYear}`,
    whatsapp: asString(
      raw.whatsappNumber ?? raw.whatsapp
    ),
    avatarBg: '#17243A',
    createdAt: asString(
      raw.createdAt,
      new Date().toISOString()
    ),
  };
};

const normalizeComment = (
  value: unknown,
  postId: string
): Comment => {
  const raw = asRecord(value);
  const author = asRecord(raw.authorId);

  return {
    id: asString(
      raw._id ?? raw.id,
      `comment-${Date.now()}`
    ),
    postId,
    authorId: getObjectId(raw.authorId),
    authorName: asString(
      author.name,
      'Campus student'
    ),
    authorUniversity: asString(
      author.university,
      'Other'
    ),
    content: asString(raw.text ?? raw.content),
    createdAt: asString(
      raw.createdAt,
      new Date().toISOString()
    ),
  };
};

const normalizePost = (value: unknown): Post => {
  const raw = asRecord(value);
  const postId = asString(raw._id ?? raw.id);
  const author = asRecord(raw.authorId);

  const comments = Array.isArray(raw.comments)
    ? raw.comments.map((comment) =>
      normalizeComment(comment, postId)
    )
    : [];

  const category = CATEGORY_VALUES.includes(
    raw.category as Exclude<Category, 'All'>
  )
    ? (raw.category as Exclude<Category, 'All'>)
    : 'General';

  const authorUniversity = UNIVERSITY_VALUES.includes(
    (author.university ?? raw.universityTag) as Exclude<
      University,
      'All'
    >
  )
    ? ((author.university ??
      raw.universityTag) as Exclude<
        University,
        'All'
      >)
    : 'Other';

  return {
    id: postId,
    authorId: getObjectId(raw.authorId),
    authorName: asString(
      author.name,
      'Campus student'
    ),
    authorUniversity,
    authorBatch: author.batchYear
      ? `Batch ${author.batchYear}`
      : '',
    title: asString(raw.title),
    content: asString(raw.content),
    category,
    upvotes: asNumber(
      raw.upvotesCount ?? raw.upvotes
    ),
    commentCount: comments.length,
    createdAt: asString(
      raw.createdAt,
      new Date().toISOString()
    ),
    comments,
    hasUpvoted: Boolean(raw.hasUpvoted),
  };
};

const normalizeListing = (
  value: unknown
): MarketplaceItem => {
  const raw = asRecord(value);
  const seller = asRecord(raw.sellerId);

  const university = UNIVERSITY_VALUES.includes(
    (raw.universityTag ?? seller.university) as Exclude<
      University,
      'All'
    >
  )
    ? ((raw.universityTag ??
      seller.university) as Exclude<
        University,
        'All'
      >)
    : 'Other';

  return {
    id: asString(raw._id ?? raw.id),
    sellerId: getObjectId(raw.sellerId),
    sellerName: asString(
      seller.name,
      'Campus student'
    ),
    sellerWhatsapp: asString(
      seller.whatsappNumber ?? seller.whatsapp
    ),
    title: asString(raw.title),
    courseName: asString(
      raw.courseName,
      asString(raw.courseCode)
    ),
    courseCode: asString(
      raw.courseCode
    ).toUpperCase(),
    university,
    price: asNumber(
      raw.pricePKR ?? raw.price
    ),
    description: asString(raw.description),
    driveLink:
      asString(raw.driveLink) || undefined,
    coverImage:
      asString(raw.coverImage) || undefined,
    createdAt: asString(
      raw.createdAt,
      new Date().toISOString()
    ),
  };
};

const readSavedPostIds = (): string[] => {
  try {
    const value = JSON.parse(
      localStorage.getItem(
        STORAGE_KEYS.SAVED_POST_IDS
      ) || '[]'
    );

    return Array.isArray(value)
      ? value.map(String)
      : [];
  } catch {
    return [];
  }
};

const writeSavedPostIds = (ids: string[]) => {
  localStorage.setItem(
    STORAGE_KEYS.SAVED_POST_IDS,
    JSON.stringify(ids)
  );
};

const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem(
    STORAGE_KEYS.TOKEN
  );

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError(
      `Cannot connect to the CampusConnect API at ${API_BASE}. ` +
      'Start the backend and check your network connection.'
    );
  }

  const text = await response.text();

  let body: unknown = {};

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }

    throw new ApiError(
      asString(asRecord(body).message) ||
      `Request failed (${response.status})`,
      response.status
    );
  }

  return body as T;
};

const queryString = (
  params: Record<string, string | undefined>
) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (value) {
        search.set(key, value);
      }
    }
  );

  const result = search.toString();
  return result ? `?${result}` : '';
};

// ─── Authentication service ──────────────────────────────────────────────────

export const authService = {
  async getCurrentUser(): Promise<{
    user: User | null;
    token: string | null;
  }> {
    const token = localStorage.getItem(
      STORAGE_KEYS.TOKEN
    );

    const storedUser = localStorage.getItem(
      STORAGE_KEYS.USER
    );

    if (!token || !storedUser) {
      return {
        user: null,
        token: null,
      };
    }

    try {
      return {
        user: normalizeUser(JSON.parse(storedUser)),
        token,
      };
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);

      return {
        user: null,
        token: null,
      };
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{
    user: User;
    token: string;
  }> {
    const result = await apiRequest<{
      token: string;
      user: ApiRecord;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const user = normalizeUser(result.user);

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      result.token
    );

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user)
    );

    return {
      user,
      token: result.token,
    };
  },

  async register(data: {
    name: string;
    email: string;
    university: Exclude<University, 'All'>;
    batch: string;
    whatsapp: string;
    password: string;
  }): Promise<{
    user: User;
    token: string;
  }> {
    const batchYear = Number(
      data.batch.replace(/\D/g, '')
    );

    if (
      !Number.isInteger(batchYear) ||
      batchYear < 2000 ||
      batchYear > 2100
    ) {
      throw new ApiError(
        'Batch year must be an integer between 2000 and 2100.'
      );
    }

    const result = await apiRequest<{
      token: string;
      user: ApiRecord;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        university: data.university,
        batchYear,
        whatsappNumber: data.whatsapp.trim(),
      }),
    });

    const user = normalizeUser(result.user);

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      result.token
    );

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user)
    );

    return {
      user,
      token: result.token,
    };
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};

const shouldUseMockData = () => DATA_MODE === 'mock';
const shouldFallbackToMockData = () => DATA_MODE === 'hybrid';

const readMockPosts = (): Post[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
  return raw ? (JSON.parse(raw) as Post[]) : INITIAL_POSTS;
};

const writeMockPosts = (posts: Post[]) => {
  localStorage.setItem(
    STORAGE_KEYS.POSTS,
    JSON.stringify(posts)
  );
};

const getMockPosts = (
  university?: University,
  category?: Category
) => {
  const savedIds = readSavedPostIds();
  let posts = readMockPosts().map((post) => ({
    ...post,
    isSaved: savedIds.includes(post.id),
  }));

  if (university && university !== 'All') {
    posts = posts.filter(
      (post) => post.authorUniversity === university
    );
  }

  if (category && category !== 'All') {
    posts = posts.filter(
      (post) => post.category === category
    );
  }

  return posts;
};

const createMockPost = (data: {
  title: string;
  content: string;
  category: Exclude<Category, 'All'>;
  university: Exclude<University, 'All'>;
  user: User;
}) => {
  const post: Post = {
    id: `post-${Date.now()}`,
    authorId: data.user.id,
    authorName: data.user.name,
    authorUniversity: data.university,
    authorBatch: data.user.batch,
    title: data.title.trim(),
    content: data.content.trim(),
    category: data.category,
    upvotes: 1,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    hasUpvoted: true,
    isSaved: false,
    comments: [],
  };

  writeMockPosts([post, ...readMockPosts()]);
  return post;
};

const toggleMockUpvote = (postId: string) => {
  const posts = readMockPosts();
  let result = {
    upvotes: 0,
    hasUpvoted: false,
  };

  writeMockPosts(
    posts.map((post) => {
      if (post.id !== postId) return post;

      const currentlyUpvoted = Boolean(post.hasUpvoted);
      const upvotes = currentlyUpvoted
        ? Math.max(0, post.upvotes - 1)
        : post.upvotes + 1;

      result = {
        upvotes,
        hasUpvoted: !currentlyUpvoted,
      };

      return {
        ...post,
        upvotes,
        hasUpvoted: !currentlyUpvoted,
      };
    })
  );

  return result;
};

const addMockComment = (
  postId: string,
  text: string,
  user: User
) => {
  const posts = readMockPosts();
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    postId,
    authorId: user.id,
    authorName: user.name,
    authorUniversity: user.university,
    content: text.trim(),
    createdAt: new Date().toISOString(),
  };

  writeMockPosts(
    posts.map((post) =>
      post.id === postId
        ? {
          ...post,
          commentCount: post.commentCount + 1,
          comments: [...post.comments, comment],
        }
        : post
    )
  );

  return comment;
};

const readMockListings = (): MarketplaceItem[] => {
  const raw = localStorage.getItem(
    STORAGE_KEYS.MARKETPLACE
  );
  return raw
    ? (JSON.parse(raw) as MarketplaceItem[])
    : INITIAL_MARKETPLACE;
};

const writeMockListings = (
  listings: MarketplaceItem[]
) => {
  localStorage.setItem(
    STORAGE_KEYS.MARKETPLACE,
    JSON.stringify(listings)
  );
};

const filterMockListings = (
  params?: {
    university?: University;
    type?: 'all' | 'free' | 'paid';
    courseQuery?: string;
  }
) => {
  let listings = readMockListings();

  if (
    params?.university &&
    params.university !== 'All'
  ) {
    listings = listings.filter(
      (listing) =>
        listing.university === params.university
    );
  }

  if (params?.type === 'free') {
    listings = listings.filter(
      (listing) => listing.price === 0
    );
  } else if (params?.type === 'paid') {
    listings = listings.filter(
      (listing) => listing.price > 0
    );
  }

  const search = params?.courseQuery
    ?.trim()
    .toLowerCase();

  if (search) {
    listings = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(search) ||
        listing.courseName.toLowerCase().includes(search) ||
        listing.courseCode.toLowerCase().includes(search)
    );
  }

  return listings;
};

const createMockListing = (
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
) => {
  const listing: MarketplaceItem = {
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
    createdAt: new Date().toISOString(),
  };

  writeMockListings([listing, ...readMockListings()]);
  return listing;
};

// ─── Posts service ───────────────────────────────────────────────────────────

export const postsService = {
  async getPosts(
    university?: University,
    category?: Category
  ): Promise<Post[]> {
    if (shouldUseMockData()) {
      await delay(60);
      return getMockPosts(university, category);
    }

    try {
      const result = await apiRequest<{
        posts: ApiRecord[];
      }>(
        `/api/posts${queryString({
          uni:
            university && university !== 'All'
              ? university
              : undefined,
          category:
            category && category !== 'All'
              ? category
              : undefined,
        })}`
      );

      const savedIds = readSavedPostIds();

      return (result.posts || [])
        .map(normalizePost)
        .map((post) => ({
          ...post,
          isSaved: savedIds.includes(post.id),
        }));
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(60);
        return getMockPosts(university, category);
      }
      throw error;
    }
  },

  async getSavedPosts(): Promise<Post[]> {
    const savedIds = readSavedPostIds();

    if (!savedIds.length) {
      return [];
    }

    const posts = await this.getPosts();

    return posts.filter((post) =>
      savedIds.includes(post.id)
    );
  },

  async createPost(data: {
    title: string;
    content: string;
    category: Exclude<Category, 'All'>;
    university: Exclude<University, 'All'>;
    user: User;
  }): Promise<Post> {
    if (shouldUseMockData()) {
      await delay(100);
      return createMockPost(data);
    }

    try {
      const result = await apiRequest<{
        post: ApiRecord;
      }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title.trim(),
          content: data.content.trim(),
          category: data.category,
          universityTag: data.university,
        }),
      });

      const post = normalizePost(result.post);

      return {
        ...post,
        isSaved: readSavedPostIds().includes(post.id),
      };
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(100);
        return createMockPost(data);
      }
      throw error;
    }
  },

  async toggleUpvote(postId: string): Promise<{
    upvotes: number;
    hasUpvoted: boolean;
  }> {
    if (shouldUseMockData()) {
      await delay(40);
      return toggleMockUpvote(postId);
    }

    try {
      const result = await apiRequest<{
        upvoted: boolean;
        upvotesCount: number;
      }>(
        `/api/posts/${encodeURIComponent(postId)}/upvote`,
        {
          method: 'POST',
        }
      );

      return {
        upvotes: asNumber(result.upvotesCount),
        hasUpvoted: Boolean(result.upvoted),
      };
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(40);
        return toggleMockUpvote(postId);
      }
      throw error;
    }
  },

  async toggleSavePost(
    postId: string
  ): Promise<boolean> {
    const currentIds = readSavedPostIds();

    const nextIds = currentIds.includes(postId)
      ? currentIds.filter((id) => id !== postId)
      : [...currentIds, postId];

    writeSavedPostIds(nextIds);

    return nextIds.includes(postId);
  },

  async addComment(
    postId: string,
    text: string,
    _user: User
  ): Promise<Comment> {
    if (shouldUseMockData()) {
      await delay(60);
      return addMockComment(postId, text, _user);
    }

    try {
      const result = await apiRequest<{
        post: ApiRecord;
      }>(
        `/api/posts/${encodeURIComponent(postId)}/comment`,
        {
          method: 'POST',
          body: JSON.stringify({
            text: text.trim(),
          }),
        }
      );

      const post = normalizePost(result.post);
      const comment =
        post.comments[post.comments.length - 1];

      if (!comment) {
        throw new ApiError(
          'The comment was saved but could not be read back.'
        );
      }

      return comment;
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(60);
        return addMockComment(postId, text, _user);
      }
      throw error;
    }
  },
};

// ─── Marketplace service ─────────────────────────────────────────────────────

export const marketplaceService = {
  async getListings(params?: {
    university?: University;
    type?: 'all' | 'free' | 'paid';
    courseQuery?: string;
  }): Promise<MarketplaceItem[]> {
    if (shouldUseMockData()) {
      await delay(60);
      return filterMockListings(params);
    }

    try {
      const result = await apiRequest<{
        listings: ApiRecord[];
      }>(
        `/api/marketplace${queryString({
          uni:
            params?.university &&
              params.university !== 'All'
              ? params.university
              : undefined,
        })}`
      );

      let listings = (result.listings || [])
        .map(normalizeListing);

      if (params?.type === 'free') {
        listings = listings.filter(
          (listing) => listing.price === 0
        );
      } else if (params?.type === 'paid') {
        listings = listings.filter(
          (listing) => listing.price > 0
        );
      }

      const search = params?.courseQuery
        ?.trim()
        .toLowerCase();

      if (search) {
        listings = listings.filter(
          (listing) =>
            listing.title
              .toLowerCase()
              .includes(search) ||
            listing.courseName
              .toLowerCase()
              .includes(search) ||
            listing.courseCode
              .toLowerCase()
              .includes(search)
        );
      }

      return listings;
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(60);
        return filterMockListings(params);
      }
      throw error;
    }
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
    _user: User
  ): Promise<MarketplaceItem> {
    if (shouldUseMockData()) {
      await delay(120);
      return createMockListing(data, _user);
    }

    try {
      const result = await apiRequest<{
        listing: ApiRecord;
      }>('/api/marketplace', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title.trim(),
          courseName: data.courseName.trim(),
          courseCode: data.courseCode
            .trim()
            .toUpperCase(),
          pricePKR: data.price,
          universityTag: data.university,
          description: data.description.trim(),
          driveLink: data.driveLink?.trim() || '',
          coverImage: data.coverImage?.trim() || '',
        }),
      });

      return normalizeListing(result.listing);
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(120);
        return createMockListing(data, _user);
      }
      throw error;
    }
  },

  async deleteListing(
    listingId: string
  ): Promise<void> {
    if (shouldUseMockData()) {
      await delay(50);
      writeMockListings(
        readMockListings().filter(
          (listing) => listing.id !== listingId
        )
      );
      return;
    }

    try {
      await apiRequest(
        `/api/marketplace/${encodeURIComponent(listingId)}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      if (shouldFallbackToMockData()) {
        await delay(50);
        writeMockListings(
          readMockListings().filter(
            (listing) => listing.id !== listingId
          )
        );
        return;
      }
      throw error;
    }
  },
};