// ABOUTME: Marp 引擎的單元測試
// ABOUTME: 測試渲染功能、錯誤處理、主題管理和驗證功能

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MarpEngine,
  getMarpEngine,
  resetMarpEngine,
  renderMarkdownToSlides,
  validateMarpMarkdown,
} from './marp';
import { MarpRenderOptions } from '@/types/marp';

// Mock Marp Core
vi.mock('@marp-team/marp-core', () => ({
  Marp: vi.fn().mockImplementation(() => ({
    render: vi.fn().mockImplementation(markdown => {
      // 模擬根據內容返回不同的結果
      const sections = markdown
        .split('---')
        .map(
          (section: string, index: number) =>
            `<section><h1>${section.includes('#') ? section.match(/# (.+)/)?.[1] || `Test Slide ${index + 1}` : `Test Slide ${index + 1}`}</h1>${section.includes('```javascript') ? '<code>javascript</code>' : ''}</section>`
        )
        .join('');

      return {
        html: sections,
        css: 'section { background: white; }',
      };
    }),
  })),
}));

describe('MarpEngine', () => {
  let engine: MarpEngine;

  beforeEach(() => {
    resetMarpEngine();
    engine = new MarpEngine();
  });

  describe('基本渲染功能', () => {
    it('應能成功渲染簡單的 Markdown', async () => {
      const markdown = '# 測試標題\n\n這是測試內容';
      const result = await engine.render(markdown);

      expect(result).toBeDefined();
      expect(result.html).toContain('<section>');
      expect(result.css).toBeDefined();
      expect(result.slideCount).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('應能處理多張投影片', async () => {
      const markdown = `# 第一張投影片

---

# 第二張投影片

---

# 第三張投影片`;

      const result = await engine.render(markdown);
      expect(result.slideCount).toBe(3);
    });

    it('應能正確提取註釋', async () => {
      const markdown = `# 標題

<!-- 這是註釋 -->

內容

<!-- 另一個註釋 -->`;

      const result = await engine.render(markdown);
      expect(result.comments).toHaveLength(2);
      expect(result.comments[0]).toBe('這是註釋');
      expect(result.comments[1]).toBe('另一個註釋');
    });

    it('應能處理程式碼區塊', async () => {
      const markdown = `# 程式碼示例

\`\`\`javascript
function hello() {
  console.log('Hello World');
}
\`\`\``;

      const result = await engine.render(markdown);
      expect(result.html).toContain('javascript');
      expect(result.slideCount).toBe(1);
    });
  });

  describe('錯誤處理', () => {
    it('應拒絕空的 Markdown 內容', async () => {
      await expect(engine.render('')).rejects.toThrow('Markdown 內容不能為空');
      await expect(engine.render('   ')).rejects.toThrow(
        'Markdown 內容不能為空'
      );
    });

    it('應處理渲染錯誤', async () => {
      // Mock Marp 拋出錯誤
      const mockMarp = {
        render: vi.fn().mockImplementation(() => {
          throw new Error('渲染失敗');
        }),
      };

      const engineWithError = new MarpEngine();
      (engineWithError as unknown as { marp: typeof mockMarp }).marp = mockMarp;

      await expect(engineWithError.render('# 測試')).rejects.toThrow();
    });

    it('應處理空的渲染結果', async () => {
      // Mock Marp 返回空結果
      const mockMarp = {
        render: vi.fn().mockReturnValue({ html: '', css: '' }),
      };

      const engineWithEmptyResult = new MarpEngine();
      (engineWithEmptyResult as unknown as { marp: typeof mockMarp }).marp =
        mockMarp;

      await expect(engineWithEmptyResult.render('# 測試')).rejects.toThrow(
        '渲染結果為空，請檢查 Markdown 格式'
      );
    });
  });

  describe('主題管理', () => {
    it('應能獲取內建主題', () => {
      const themes = engine.getAvailableThemes();
      expect(themes).toHaveLength(3);
      expect(themes.map(t => t.id)).toContain('default');
      expect(themes.map(t => t.id)).toContain('gaia');
      expect(themes.map(t => t.id)).toContain('uncover');
    });

    it('應能設定主題', () => {
      expect(() => engine.setTheme('gaia')).not.toThrow();
      const currentTheme = engine.getCurrentTheme();
      expect(currentTheme?.id).toBe('gaia');
    });

    it('應拒絕不存在的主題', () => {
      expect(() => engine.setTheme('nonexistent')).toThrow(
        '找不到主題: nonexistent'
      );
    });

    it('應能添加自訂主題', () => {
      const customTheme = {
        id: 'custom',
        name: 'custom',
        displayName: '自訂主題',
        css: 'body { color: red; }',
      };

      engine.addCustomTheme(customTheme);
      const themes = engine.getAvailableThemes();
      const addedTheme = themes.find(t => t.id === 'custom');

      expect(addedTheme).toBeDefined();
      expect(addedTheme?.isBuiltIn).toBe(false);
      expect(addedTheme?.displayName).toBe('自訂主題');
    });
  });

  describe('Markdown 驗證', () => {
    it('應驗證有效的 Markdown', () => {
      const markdown = '# 標題\n\n內容';
      const result = engine.validateMarkdown(markdown);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應檢測空內容', () => {
      const result = engine.validateMarkdown('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('parse');
      expect(result.errors[0]?.message).toBe('Markdown 內容為空');
    });

    it('應檢測未關閉的 HTML 註釋', () => {
      const markdown = '# 標題\n\n<!-- 未關閉的註釋\n\n內容';
      const result = engine.validateMarkdown(markdown);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message === '未關閉的 HTML 註釋')).toBe(
        true
      );
    });

    it('應檢測未關閉的程式碼區塊', () => {
      const markdown = '# 標題\n\n```javascript\ncode\n';
      const result = engine.validateMarkdown(markdown);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message === '未關閉的程式碼區塊')).toBe(
        true
      );
    });
  });

  describe('配置管理', () => {
    it('應能更新配置', () => {
      const newConfig = {
        defaultOptions: {
          html: false,
          math: false,
        } as Partial<MarpRenderOptions>,
      };

      expect(() => engine.updateConfig(newConfig)).not.toThrow();
    });

    it('應能重置到預設狀態', () => {
      // 先修改主題
      engine.setTheme('gaia');
      expect(engine.getCurrentTheme()?.id).toBe('gaia');

      // 重置
      engine.reset();
      expect(engine.getCurrentTheme()?.id).toBe('default');
    });
  });
});

describe('MarpEngine 單例管理', () => {
  beforeEach(() => {
    resetMarpEngine();
  });

  it('應返回相同的實例', () => {
    const engine1 = getMarpEngine();
    const engine2 = getMarpEngine();
    expect(engine1).toBe(engine2);
  });

  it('應能使用配置創建新實例', () => {
    const engine1 = getMarpEngine();
    const engine2 = getMarpEngine({ debug: true });
    expect(engine1).not.toBe(engine2);
  });

  it('應能重置實例', () => {
    const engine1 = getMarpEngine();
    resetMarpEngine();
    const engine2 = getMarpEngine();
    expect(engine1).not.toBe(engine2);
  });
});

describe('便利函數', () => {
  beforeEach(() => {
    resetMarpEngine();
  });

  it('renderMarkdownToSlides 應能正常工作', async () => {
    const markdown = '# 測試標題';
    const result = await renderMarkdownToSlides(markdown);

    expect(result).toBeDefined();
    expect(result.html).toContain('<section>');
    expect(result.slideCount).toBeGreaterThan(0);
  });

  it('validateMarpMarkdown 應能正常工作', () => {
    const markdown = '# 有效的 Markdown';
    const result = validateMarpMarkdown(markdown);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('應能傳遞渲染選項', async () => {
    const markdown = '# 測試';
    const options: Partial<MarpRenderOptions> = {
      html: false,
      theme: 'gaia',
    };

    const result = await renderMarkdownToSlides(markdown, options);
    expect(result).toBeDefined();
  });
});

describe('投影片解析', () => {
  let engine: MarpEngine;

  beforeEach(() => {
    resetMarpEngine();
    engine = new MarpEngine();
  });

  it('應能正確解析投影片內容', async () => {
    const markdown = `# 標題 1

內容 1

---

# 標題 2

內容 2`;

    const result = await engine.render(markdown);
    expect(result.slides).toHaveLength(2);
  });

  it('應能提取投影片標題', async () => {
    const markdown = '# 我的標題\n\n內容';
    const result = await engine.render(markdown);

    expect(result.slides[0]?.title).toBe('我的標題');
  });
});
