-- Migration to support Suno prompt and new tags for music management
ALTER TABLE songs ADD COLUMN prompt TEXT NOT NULL DEFAULT '';
ALTER TABLE songs ADD COLUMN time_tags TEXT NOT NULL DEFAULT '[]';
-- We'll use mood_tags as emotion_tags as per user request (emotionTags in JS)
