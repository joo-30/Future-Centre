import { Router } from 'express';
import { StoryModel } from '../../models/story.model.js';
import { storyPublic } from '../../presenters/portal.js';

export const router = Router();

router.get('/stories', async (_req, res) => {
  const stories = await StoryModel.find({ published: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  res.json({ stories: stories.map(storyPublic) });
});
