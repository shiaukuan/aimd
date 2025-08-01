// ABOUTME: Marp Core 引擎封裝，提供統一的投影片渲染介面
// ABOUTME: 處理 Markdown 到 HTML 投影片轉換、主題管理和錯誤處理

import { Marp } from '@marp-team/marp-core';
import {
  MarpRenderOptions,
  MarpRenderResult,
  MarpSlide,
  MarpError,
  MarpEngineConfig,
  MarpTheme,
} from '@/types/marp';

class MarpEngine {
  private marp: Marp;
  private config: MarpEngineConfig;

  constructor(config?: Partial<MarpEngineConfig>) {
    // 預設配置
    this.config = {
      defaultOptions: {
        html: true,
        allowUnsafeInlineHtml: false,
        math: true,
        theme: 'default',
      },
      themes: this.getBuiltInThemes(),
      currentTheme: 'default',
      debug: process.env.NODE_ENV === 'development',
      ...config,
    };

    // 初始化 Marp 實例
    this.marp = new Marp(this.config.defaultOptions);
    this.setupThemes();
  }

  /**
   * 渲染 Markdown 為投影片
   */
  async render(
    markdown: string,
    options?: Partial<MarpRenderOptions>
  ): Promise<MarpRenderResult> {
    try {
      if (!markdown || !markdown.trim()) {
        throw new Error('Markdown 內容不能為空');
      }

      const renderOptions = { ...this.config.defaultOptions, ...options };
      
      // 如果有自訂選項，重新配置 Marp
      if (options) {
        this.marp = new Marp(renderOptions);
        this.setupThemes();
      }

      const startTime = Date.now();
      const result = this.marp.render(markdown);
      const renderTime = Date.now() - startTime;

      if (!result.html) {
        throw new Error('渲染結果為空，請檢查 Markdown 格式');
      }

      // 解析投影片
      const slides = this.parseSlides(result.html, markdown);
      const comments = this.extractComments(markdown);

      const renderResult: MarpRenderResult = {
        html: result.html,
        css: result.css,
        slideCount: Math.max(slides.length, 1),
        slides,
        comments,
        timestamp: Date.now(),
      };

      if (this.config.debug) {
        console.log(`Marp 渲染完成 - 耗時: ${renderTime}ms, 投影片數: ${renderResult.slideCount}`);
      }

      return renderResult;
    } catch (error) {
      const marpError = this.createMarpError(error, 'render');
      if (this.config.debug) {
        console.error('Marp 渲染錯誤:', marpError);
      }
      throw marpError;
    }
  }

  /**
   * 設定主題
   */
  setTheme(themeId: string): void {
    const theme = this.config.themes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`找不到主題: ${themeId}`);
    }

    this.config.currentTheme = themeId;
    this.config.defaultOptions.theme = theme.name;
    
    // 重新初始化 Marp 實例
    this.marp = new Marp(this.config.defaultOptions);
    this.setupThemes();
  }

  /**
   * 獲取當前主題
   */
  getCurrentTheme(): MarpTheme | undefined {
    return this.config.themes.find(t => t.id === this.config.currentTheme);
  }

  /**
   * 獲取所有可用主題
   */
  getAvailableThemes(): MarpTheme[] {
    return [...this.config.themes];
  }

  /**
   * 添加自訂主題
   */
  addCustomTheme(theme: Omit<MarpTheme, 'isBuiltIn'>): void {
    const customTheme: MarpTheme = {
      ...theme,
      isBuiltIn: false,
    };

    // 檢查是否已存在
    const existingIndex = this.config.themes.findIndex(t => t.id === theme.id);
    if (existingIndex >= 0) {
      this.config.themes[existingIndex] = customTheme;
    } else {
      this.config.themes.push(customTheme);
    }

    this.setupThemes();
  }

  /**
   * 驗證 Markdown 格式
   */
  validateMarkdown(markdown: string): { isValid: boolean; errors: MarpError[] } {
    const errors: MarpError[] = [];

    try {
      if (!markdown || !markdown.trim()) {
        errors.push(this.createMarpError('Markdown 內容為空', 'parse'));
      }

      // 檢查基本的 Marp 語法
      const lines = markdown.split('\n');
      let inCodeBlock = false;
      let slideCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        const lineNumber = i + 1;

        // 檢查程式碼區塊
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }

        // 跳過程式碼區塊內容
        if (inCodeBlock) continue;

        // 檢查投影片分隔符
        if (line.trim() === '---') {
          slideCount++;
        }

        // 檢查 HTML 註釋格式
        if (line.includes('<!--') && !line.includes('-->')) {
          errors.push(this.createMarpError(
            '未關閉的 HTML 註釋',
            'parse',
            `第 ${lineNumber} 行`,
            lineNumber
          ));
        }
      }

      if (inCodeBlock) {
        errors.push(this.createMarpError('未關閉的程式碼區塊', 'parse'));
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(this.createMarpError(error, 'parse'));
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * 設定引擎配置
   */
  updateConfig(config: Partial<MarpEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.marp = new Marp(this.config.defaultOptions);
    this.setupThemes();
  }

  /**
   * 重置引擎到預設狀態
   */
  reset(): void {
    this.config = {
      defaultOptions: {
        html: true,
        allowUnsafeInlineHtml: false,
        math: true,
        theme: 'default',
      },
      themes: this.getBuiltInThemes(),
      currentTheme: 'default',
      debug: process.env.NODE_ENV === 'development',
    };

    this.marp = new Marp(this.config.defaultOptions);
    this.setupThemes();
  }

  /**
   * 解析投影片內容
   */
  private parseSlides(html: string, markdown: string): MarpSlide[] {
    const slides: MarpSlide[] = [];
    
    try {
      // 使用正則表達式匹配 section 標籤
      const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/g;
      let match;
      let slideIndex = 0;

      while ((match = sectionRegex.exec(html)) !== null) {
        const slideContent = match[1];
        if (!slideContent) continue;
        
        const slideNotes = this.extractSlideNotes(markdown, slideIndex);
        const slideClass = this.extractSlideClass(match[0]);
        const slideTitle = this.extractSlideTitle(slideContent);

        slides.push({
          content: slideContent,
          ...(slideNotes && { notes: slideNotes }),
          ...(slideTitle && { title: slideTitle }),
          ...(slideClass && { class: slideClass }),
        });

        slideIndex++;
      }

      // 如果沒有找到 section，創建單一投影片
      if (slides.length === 0 && html.trim()) {
        const title = this.extractSlideTitle(html);
        slides.push({
          content: html,
          ...(title && { title }),
        });
      }

      return slides;
    } catch (error) {
      console.warn('解析投影片時發生錯誤:', error);
      return [{
        content: html,
        title: '投影片',
      }];
    }
  }

  /**
   * 提取註釋
   */
  private extractComments(markdown: string): string[] {
    const comments: string[] = [];
    const commentRegex = /<!--\s*(.*?)\s*-->/g;
    let match;

    while ((match = commentRegex.exec(markdown)) !== null) {
      const comment = match[1]?.trim();
      if (comment && !comment.startsWith('_')) { // 排除 Marp 指令
        comments.push(comment);
      }
    }

    return comments;
  }

  /**
   * 提取投影片備註
   */
  private extractSlideNotes(markdown: string, slideIndex: number): string | undefined {
    // 簡單實現：尋找投影片對應的註釋
    const lines = markdown.split('\n');
    const slideDelimiters: number[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '---') {
        slideDelimiters.push(index);
      }
    });

    // 找到對應投影片的範圍
    const startLine = slideIndex === 0 ? 0 : (slideDelimiters[slideIndex - 1] ?? 0) + 1;
    const endLine = slideIndex < slideDelimiters.length ? slideDelimiters[slideIndex] : lines.length;
    
    const slideLines = lines.slice(startLine, endLine);
    const notes = slideLines
      .filter(line => line.trim().startsWith('<!--') && line.includes('notes:'))
      .map(line => line.replace(/<!--\s*notes:\s*|\s*-->/g, '').trim())
      .join(' ');

    return notes || undefined;
  }

  /**
   * 提取投影片類別
   */
  private extractSlideClass(sectionHtml: string): string | undefined {
    const classMatch = sectionHtml.match(/class="([^"]*)"/) || sectionHtml.match(/class='([^']*)'/);
    return classMatch ? classMatch[1] : undefined;
  }

  /**
   * 提取投影片標題
   */
  private extractSlideTitle(content: string): string | undefined {
    // 尋找第一個標題
    const titleMatch = content.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/);
    if (titleMatch && titleMatch[2]) {
      return titleMatch[2].replace(/<[^>]*>/g, '').trim();
    }

    // 備選：尋找粗體文字
    const boldMatch = content.match(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/);
    if (boldMatch) {
      return boldMatch[2].replace(/<[^>]*>/g, '').trim();
    }

    return undefined;
  }

  /**
   * 設定主題
   */
  private setupThemes(): void {
    // 目前使用預設主題，未來可以擴展更多主題
    // Marp Core 預設主題會自動載入
  }

  /**
   * 獲取內建主題
   */
  private getBuiltInThemes(): MarpTheme[] {
    return [
      {
        id: 'default',
        name: 'default',
        displayName: '預設主題',
        description: 'Marp 預設主題',
        css: '',
        isBuiltIn: true,
      },
      {
        id: 'gaia',
        name: 'gaia',
        displayName: 'Gaia',
        description: '簡潔現代的投影片主題',
        css: '',
        isBuiltIn: true,
      },
      {
        id: 'uncover',
        name: 'uncover',
        displayName: 'Uncover',
        description: '漸進式展示主題',
        css: '',
        isBuiltIn: true,
      },
    ];
  }

  /**
   * 創建 Marp 錯誤物件
   */
  private createMarpError(
    error: unknown,
    type: MarpError['type'],
    details?: string,
    line?: number,
    column?: number
  ): MarpError {
    let message: string;
    let originalError: Error | undefined;

    if (error instanceof Error) {
      message = error.message;
      originalError = error;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = '未知錯誤';
    }

    return {
      type,
      message,
      details,
      line,
      column,
      originalError,
    };
  }
}

// 單例實例
let marpEngineInstance: MarpEngine | null = null;

/**
 * 獲取 Marp 引擎實例
 */
export function getMarpEngine(config?: Partial<MarpEngineConfig>): MarpEngine {
  if (!marpEngineInstance || config) {
    marpEngineInstance = new MarpEngine(config);
  }
  return marpEngineInstance;
}

/**
 * 重置 Marp 引擎實例
 */
export function resetMarpEngine(): void {
  marpEngineInstance = null;
}

// 導出類別以供測試使用
export { MarpEngine };

// 導出便利函數
export async function renderMarkdownToSlides(
  markdown: string,
  options?: Partial<MarpRenderOptions>
): Promise<MarpRenderResult> {
  const engine = getMarpEngine();
  return engine.render(markdown, options);
}

export function validateMarpMarkdown(markdown: string) {
  const engine = getMarpEngine();
  return engine.validateMarkdown(markdown);
}