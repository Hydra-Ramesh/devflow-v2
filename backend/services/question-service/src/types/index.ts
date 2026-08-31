export interface AuthorDTO {
  id: string;
  fullName: string | null;
  full_name?: string | null;
  avatarUrl: string | null;
  avatar_url?: string | null;
  reputation?: number;
  email?: string;
}

export interface QuestionDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  tags: string[];
  viewCount: number;
  view_count?: number;
  upvotesCount: number;
  downvotesCount: number;
  upvotes?: number;
  downvotes?: number;
  answersCount: number;
  answers_count?: number;
  commentsCount?: number;
  comments_count?: number;
  isSolved: boolean;
  acceptedAnswerId: string | null;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
  author?: AuthorDTO;
}

export interface CreateQuestionInput {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateQuestionInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface QuestionFilterQuery {
  page?: number;
  limit?: number;
  q?: string;
  tags?: string[];
  filter?: 'newest' | 'frequent' | 'unanswered' | 'votes';
  authorId?: string;
}

export interface PaginatedResult<T> {
  questions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UserTokenPayload {
  id: string;
  email?: string;
  role?: string;
  sid?: string;
}
