export type StoryCategory = 'إنقاص وزن' | 'مقاومة الأنسولين' | 'تغذية' | 'صحة المرأة' | string;

export interface SuccessStory {
  id: string;
  name: string;
  title: string;
  age?: number;
  category: StoryCategory;
  weightLostKg: number;
  durationMonths?: number;
  durationText: string;
  beforeWeight?: number;
  afterWeight?: number;
  programTitle: string;
  quote: string;
  details?: string;
  imageUrl?: string;
  detailsImageUrl?: string;
  additionalImages?: string[];
  storyType?: 'transformation' | 'review';
  verified?: boolean;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt?: string;
}
