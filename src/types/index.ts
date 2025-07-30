// ABOUTME: Core TypeScript type definitions for the markdown slides application
// ABOUTME: Contains interfaces and types for slides, editor, preview, and API responses

// Slide related types
export interface Slide {
  id: string;
  content: string;
  metadata: SlideMetadata;
  order: number;
}

export interface SlideMetadata {
  title?: string;
  theme?: string;
  class?: string;
  paginate?: boolean;
  backgroundColor?: string;
  color?: string;
}

export interface SlideCollection {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalSlides: number;
    theme: string;
    language: string;
  };
}

// Editor related types
export interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
  isModified: boolean;
  lastSaved: Date | null;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark';
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
}

// Preview related types
export interface PreviewState {
  currentSlide: number;
  totalSlides: number;
  zoom: number;
  isFullscreen: boolean;
  showThumbnails: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MarpRenderResult {
  html: string;
  css: string;
  slides: {
    content: string;
    notes: string;
  }[];
  comments: string[];
}

// Generation related types
export interface GenerationRequest {
  topic: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  maxPages: number;
  includeCode: boolean;
  includeImages: boolean;
  language: string;
  apiKey: string;
}

export interface GenerationResponse {
  id: string;
  markdown: string;
  tokenUsage: TokenUsage;
  createdAt: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface GenerationState {
  isLoading: boolean;
  progress: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error: string | null;
  result: GenerationResponse | null;
}

// Export related types
export interface ExportRequest {
  markdown: string;
  format: 'pptx';
  theme?: string;
  options?: ExportOptions;
}

export interface ExportOptions {
  slideSize: 'standard' | 'widescreen';
  includeNotes: boolean;
  quality: 'low' | 'medium' | 'high';
}

export interface ExportState {
  isExporting: boolean;
  progress: number;
  error: string | null;
}

// Theme related types
export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  preview: string; // URL to preview image
  css: string;
  variables: Record<string, string>;
}

export interface ThemeState {
  currentTheme: string;
  availableThemes: Theme[];
  customThemes: Theme[];
}

// API related types
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Application state types
export interface AppState {
  editor: EditorState;
  preview: PreviewState;
  generation: GenerationState;
  export: ExportState;
  theme: ThemeState;
  settings: {
    editor: EditorSettings;
    preview: PreviewSettings;
  };
}

export interface PreviewSettings {
  zoom: number;
  currentSlide: number;
  isFullscreen: boolean;
  showThumbnails: boolean;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Event types
export interface EditorChangeEvent {
  content: string;
  cursorPosition: number;
  isModified: boolean;
}

export interface SlideNavigationEvent {
  slideIndex: number;
  totalSlides: number;
}

export interface ThemeChangeEvent {
  themeId: string;
  themeName: string;
}