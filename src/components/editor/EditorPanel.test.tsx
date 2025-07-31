import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorPanel } from './EditorPanel';

describe('EditorPanel', () => {
  it('should render all main components', () => {
    render(<EditorPanel content="" />);
    
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
    expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-status-bar')).toBeInTheDocument();
  });

  it('should display initial content', () => {
    const initialContent = '# Hello World\n\nThis is a test.';
    render(<EditorPanel content={initialContent} />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(initialContent);
  });

  it('should use placeholder when content is empty', () => {
    const placeholder = '請輸入內容...';
    render(<EditorPanel content="" placeholder={placeholder} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('placeholder', placeholder);
  });

  it('should call onChange callback when content changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <EditorPanel 
        content="" 
        callbacks={{ onChange: mockOnChange }} 
      />
    );
    
    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, 'H');
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenLastCalledWith(
        'H',
        expect.objectContaining({
          characters: 1,
          words: 1,
          lines: 1
        })
      );
    });
  });

  it('should update stats when content changes', async () => {
    const user = userEvent.setup();
    render(<EditorPanel content="" />);
    
    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, 'Hello World\nSecond line');
    
    await waitFor(() => {
      expect(screen.getByTestId('stats-words')).toHaveTextContent('4 字');
      expect(screen.getByTestId('stats-characters')).toHaveTextContent('23 字元');
      expect(screen.getByTestId('stats-lines-total')).toHaveTextContent('2 行');
    });
  });

  it('should handle toolbar actions', async () => {
    render(<EditorPanel content="test content" />);
    
    // 選取一些文字
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4); // 選取 "test"
    
    // 點擊粗體按鈕
    fireEvent.click(screen.getByTestId('toolbar-bold'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('**test** content');
    });
  });

  it('should handle keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<EditorPanel content="test content" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    
    // 選取一些文字
    textarea.setSelectionRange(0, 4);
    textarea.focus();
    
    // 按 Ctrl+B 進行粗體格式化
    await user.keyboard('{Control>}b{/Control}');
    
    await waitFor(() => {
      expect(textarea.value).toBe('**test** content');
    });
  });

  it('should call onSave callback when save action is triggered', async () => {
    const mockOnSave = vi.fn();
    render(
      <EditorPanel 
        content="test content" 
        callbacks={{ onSave: mockOnSave }} 
      />
    );
    
    // 等待內容初始化完成
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('test content');
    });
    
    fireEvent.click(screen.getByTestId('toolbar-save'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('test content');
    });
  });

  it('should handle save keyboard shortcut', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();
    
    render(
      <EditorPanel 
        content="test content" 
        callbacks={{ onSave: mockOnSave }} 
      />
    );
    
    const textarea = screen.getByTestId('editor-textarea');
    textarea.focus();
    
    await user.keyboard('{Control>}s{/Control}');
    
    expect(mockOnSave).toHaveBeenCalledWith('test content');
  });

  it('should show modified indicator when content changes', async () => {
    const user = userEvent.setup();
    render(<EditorPanel content="initial" />);
    
    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, ' changed');
    
    await waitFor(() => {
      expect(screen.getByTestId('modified-indicator')).toBeInTheDocument();
    });
  });

  it('should clear modified indicator after save', async () => {
    const user = userEvent.setup();
    render(<EditorPanel content="initial" />);
    
    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, ' changed');
    
    // 等待修改指示器出現
    await waitFor(() => {
      expect(screen.getByTestId('modified-indicator')).toBeInTheDocument();
    });
    
    // 儲存
    fireEvent.click(screen.getByTestId('toolbar-save'));
    
    // 修改指示器應該消失
    await waitFor(() => {
      expect(screen.queryByTestId('modified-indicator')).not.toBeInTheDocument();
    });
  });

  it('should be read-only when readOnly prop is true', () => {
    render(<EditorPanel content="test" readOnly={true} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('readonly');
    
    // 工具列按鈕應該被禁用
    expect(screen.getByTestId('toolbar-bold')).toBeDisabled();
    expect(screen.getByTestId('toolbar-save')).toBeDisabled();
  });

  it('should show cursor position in status bar', async () => {
    render(<EditorPanel content="Hello World" />);
    
    // 檢查初始游標位置顯示
    await waitFor(() => {
      expect(screen.getByTestId('stats-lines')).toBeInTheDocument();
      expect(screen.getByTestId('stats-column')).toBeInTheDocument();
      expect(screen.getByTestId('stats-lines')).toHaveTextContent('第 1 行');
    });
  });

  it('should show selected text stats when text is selected', async () => {
    render(<EditorPanel content="Hello World" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5); // 選取 "Hello"
    fireEvent.select(textarea);
    
    await waitFor(() => {
      expect(screen.getByTestId('stats-selected')).toHaveTextContent('5 字元');
    });
  });

  it('should handle different formatting actions correctly', async () => {
    render(<EditorPanel content="test" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    
    // 測试斜體
    textarea.setSelectionRange(0, 4);
    fireEvent.click(screen.getByTestId('toolbar-italic'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('*test*');
    });
    
    // 重置內容
    fireEvent.change(textarea, { target: { value: 'code' } });
    textarea.setSelectionRange(0, 4);
    
    // 測試程式碼
    fireEvent.click(screen.getByTestId('toolbar-code'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('`code`');
    });
  });

  it('should handle heading formatting', async () => {
    render(<EditorPanel content="heading" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 7);
    
    fireEvent.click(screen.getByTestId('toolbar-heading1'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('# heading');
    });
  });

  it('should handle list formatting', async () => {
    render(<EditorPanel content="item" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);
    
    fireEvent.click(screen.getByTestId('toolbar-bulletList'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('- item');
    });
  });

  it('should apply custom className', () => {
    render(<EditorPanel content="" className="custom-editor" />);
    
    const panel = screen.getByTestId('editor-panel');
    expect(panel).toHaveClass('custom-editor');
  });

  it('should restore selection after formatting', async () => {
    render(<EditorPanel content="test content" />);
    
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);
    
    fireEvent.click(screen.getByTestId('toolbar-bold'));
    
    await waitFor(() => {
      expect(textarea.value).toBe('**test** content');
    });
    
    // 檢查選取範圍是否正確恢復到格式化後的文字
    setTimeout(() => {
      expect(textarea.selectionStart).toBe(2);
      expect(textarea.selectionEnd).toBe(6);
    }, 10);
  });
});