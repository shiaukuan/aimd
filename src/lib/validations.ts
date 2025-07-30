// ABOUTME: Zod validation schemas for the markdown slides application
// ABOUTME: Contains form validation, API request/response schemas and data validation

import { z } from 'zod';

// Slide generation form validation
export const slideGenerationSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must be less than 200 characters'),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.enum(['gpt-4o', 'gpt-4o-mini']).default('gpt-4o'),
  maxPages: z
    .number()
    .min(5, 'Minimum 5 slides')
    .max(30, 'Maximum 30 slides')
    .default(15),
  includeCode: z.boolean().default(true),
  includeImages: z.boolean().default(false),
  language: z.enum(['zh-TW', 'en', 'zh-CN']).default('zh-TW'),
});

export type SlideGenerationInput = z.infer<typeof slideGenerationSchema>;

// API request/response schemas
export const generateSlidesApiRequestSchema = z.object({
  topic: z.string().min(1),
  model: z.enum(['gpt-4o', 'gpt-4o-mini']),
  maxPages: z.number().min(5).max(30),
  includeCode: z.boolean(),
  includeImages: z.boolean(),
  language: z.string(),
});

export const generateSlidesApiResponseSchema = z.object({
  id: z.string(),
  markdown: z.string(),
  tokenUsage: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }),
  createdAt: z.string(),
});

export const exportSlidesApiRequestSchema = z.object({
  markdown: z.string().min(1),
  format: z.enum(['pptx']).default('pptx'),
  theme: z.string().optional(),
});

// API error response schema
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.any().optional(),
});

// Editor settings validation
export const editorSettingsSchema = z.object({
  fontSize: z.number().min(10).max(24).default(14),
  tabSize: z.number().min(2).max(8).default(2),
  wordWrap: z.boolean().default(true),
  showLineNumbers: z.boolean().default(true),
  theme: z.enum(['light', 'dark']).default('light'),
});

export type EditorSettings = z.infer<typeof editorSettingsSchema>;

// Marp slide metadata
export const slideMetadataSchema = z.object({
  title: z.string().optional(),
  theme: z.string().optional(),
  class: z.string().optional(),
  paginate: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
});

export type SlideMetadata = z.infer<typeof slideMetadataSchema>;

// Preview settings
export const previewSettingsSchema = z.object({
  zoom: z.number().min(0.25).max(2).default(1),
  currentSlide: z.number().min(0).default(0),
  isFullscreen: z.boolean().default(false),
  showThumbnails: z.boolean().default(true),
});

export type PreviewSettings = z.infer<typeof previewSettingsSchema>;