// ABOUTME: Unit tests for Zod validation schemas using Vitest and colocation testing pattern
// ABOUTME: Tests all validation schemas for correct input validation and error handling

import { describe, it, expect } from 'vitest';
import {
  slideGenerationSchema,
  generateSlidesApiRequestSchema,
  generateSlidesApiResponseSchema,
  exportSlidesApiRequestSchema,
  apiErrorSchema,
  editorSettingsSchema,
  slideMetadataSchema,
  previewSettingsSchema,
} from './validations';

describe('validations', () => {
  describe('slideGenerationSchema', () => {
    it('should validate valid slide generation input', () => {
      const validInput = {
        topic: 'React Hooks',
        apiKey: 'sk-test-key',
        model: 'gpt-4o' as const,
        maxPages: 10,
        includeCode: true,
        includeImages: false,
        language: 'zh-TW' as const,
      };

      const result = slideGenerationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should apply default values', () => {
      const minimalInput = {
        topic: 'React Hooks',
        apiKey: 'sk-test-key',
      };

      const result = slideGenerationSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('gpt-4o');
        expect(result.data.maxPages).toBe(15);
        expect(result.data.includeCode).toBe(true);
        expect(result.data.includeImages).toBe(false);
        expect(result.data.language).toBe('zh-TW');
      }
    });

    it('should reject topic that is too short', () => {
      const invalidInput = {
        topic: 'Hi',
        apiKey: 'sk-test-key',
      };

      const result = slideGenerationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues.some(e => e.message.includes('at least 3 characters'))).toBe(true);
      }
    });

    it('should reject topic that is too long', () => {
      const invalidInput = {
        topic: 'A'.repeat(201),
        apiKey: 'sk-test-key',
      };

      const result = slideGenerationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues.some(e => e.message.includes('less than 200 characters'))).toBe(true);
      }
    });

    it('should reject maxPages outside valid range', () => {
      const invalidInput = {
        topic: 'React Hooks',
        apiKey: 'sk-test-key',
        maxPages: 40,
      };

      const result = slideGenerationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues.some(e => e.message.includes('Maximum 30 slides'))).toBe(true);
      }
    });

    it('should reject invalid model', () => {
      const invalidInput = {
        topic: 'React Hooks',
        apiKey: 'sk-test-key',
        model: 'invalid-model',
      };

      const result = slideGenerationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('generateSlidesApiRequestSchema', () => {
    it('should validate valid API request', () => {
      const validRequest = {
        topic: 'React Hooks',
        model: 'gpt-4o' as const,
        maxPages: 10,
        includeCode: true,
        includeImages: false,
        language: 'zh-TW',
      };

      const result = generateSlidesApiRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty topic', () => {
      const invalidRequest = {
        topic: '',
        model: 'gpt-4o' as const,
        maxPages: 10,
        includeCode: true,
        includeImages: false,
        language: 'zh-TW',
      };

      const result = generateSlidesApiRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('generateSlidesApiResponseSchema', () => {
    it('should validate valid API response', () => {
      const validResponse = {
        id: 'slide-123',
        markdown: '# My Slide\n\nContent here',
        tokenUsage: {
          prompt: 100,
          completion: 200,
          total: 300,
        },
        createdAt: '2023-01-01T00:00:00Z',
      };

      const result = generateSlidesApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('exportSlidesApiRequestSchema', () => {
    it('should validate valid export request', () => {
      const validRequest = {
        markdown: '# My Slide\n\nContent',
        format: 'pptx' as const,
        theme: 'default',
      };

      const result = exportSlidesApiRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should apply default format', () => {
      const minimalRequest = {
        markdown: '# My Slide\n\nContent',
      };

      const result = exportSlidesApiRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('pptx');
      }
    });
  });

  describe('editorSettingsSchema', () => {
    it('should validate valid editor settings', () => {
      const validSettings = {
        fontSize: 16,
        tabSize: 4,
        wordWrap: true,
        showLineNumbers: true,
        theme: 'dark' as const,
      };

      const result = editorSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const emptySettings = {};

      const result = editorSettingsSchema.safeParse(emptySettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fontSize).toBe(14);
        expect(result.data.tabSize).toBe(2);
        expect(result.data.wordWrap).toBe(true);
        expect(result.data.showLineNumbers).toBe(true);
        expect(result.data.theme).toBe('light');
      }
    });

    it('should reject fontSize outside valid range', () => {
      const invalidSettings = {
        fontSize: 5,
      };

      const result = editorSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  describe('previewSettingsSchema', () => {
    it('should validate valid preview settings', () => {
      const validSettings = {
        zoom: 1.5,
        currentSlide: 2,
        isFullscreen: true,
        showThumbnails: false,
      };

      const result = previewSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const emptySettings = {};

      const result = previewSettingsSchema.safeParse(emptySettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.zoom).toBe(1);
        expect(result.data.currentSlide).toBe(0);
        expect(result.data.isFullscreen).toBe(false);
        expect(result.data.showThumbnails).toBe(true);
      }
    });
  });

  describe('apiErrorSchema', () => {
    it('should validate valid API error', () => {
      const validError = {
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details: { field: 'topic' },
      };

      const result = apiErrorSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should validate API error without details', () => {
      const validError = {
        error: 'Server error',
        code: 'INTERNAL_ERROR',
      };

      const result = apiErrorSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });
  });
});