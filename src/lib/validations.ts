// ABOUTME: Zod 驗證 schemas，用於各種表單和 API 請求的資料驗證
// ABOUTME: 包含投影片生成、AI 設定、編輯器設定等驗證邏輯

import { z } from 'zod';

// AI 生成設定驗證
export const aiGenerationSettingsSchema = z.object({
  baseUrl: z
    .string()
    .min(1, 'Base URL 不可為空')
    .url('請輸入有效的 URL')
    .default('https://api.openai.com/v1'),
  apiKey: z
    .string()
    .min(1, 'API Key 不可為空'),
  model: z
    .string()
    .min(1, '模型名稱不可為空')
    .default('gpt-4o'),
  prompt: z
    .string()
    .min(10, '指令至少需要 10 個字符')
    .max(5000, '指令不可超過 5000 個字符')
    .default('生成pytest教學 markdown 格式教學簡報 用 換行 --- 當作換頁'),
});

// AI 生成請求驗證
export const aiGenerationRequestSchema = aiGenerationSettingsSchema;

// API 回應驗證
export const aiGenerationResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
});

// 錯誤回應驗證
export const aiGenerationErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  status: z.number().optional(),
});

// 編輯器設定驗證
export const editorSettingsSchema = z.object({
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().min(1000).max(60000).default(3000),
  fontSize: z.number().min(10).max(32).default(14),
  tabSize: z.number().min(1).max(8).default(2),
  wordWrap: z.boolean().default(true),
  lineNumbers: z.boolean().default(true),
});

// 匯出類型
export type AiGenerationSettings = z.infer<typeof aiGenerationSettingsSchema>;
export type AiGenerationRequest = z.infer<typeof aiGenerationRequestSchema>;
export type AiGenerationResponse = z.infer<typeof aiGenerationResponseSchema>;
export type AiGenerationError = z.infer<typeof aiGenerationErrorSchema>;
export type EditorSettings = z.infer<typeof editorSettingsSchema>;