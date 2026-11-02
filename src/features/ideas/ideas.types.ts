export interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string | null;
  is_pinned: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIdeaDTO {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

export interface UpdateIdeaDTO {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}
