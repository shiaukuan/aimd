import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from './EditorToolbar';
import { EditorAction } from '@/types/editor';

describe('EditorToolbar', () => {
  it('should render all toolbar groups by default', () => {
    render(<EditorToolbar />);

    expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();

    // 檢查檔案操作按鈕
    expect(screen.getByTestId('toolbar-new')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-save')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-export')).toBeInTheDocument();

    // 檢查格式化按鈕
    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-italic')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-code')).toBeInTheDocument();

    // 檢查清單按鈕
    expect(screen.getByTestId('toolbar-bulletList')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-numberedList')).toBeInTheDocument();

    // 檢查插入按鈕
    expect(screen.getByTestId('toolbar-link')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-image')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-codeBlock')).toBeInTheDocument();

    // 檢查設定按鈕
    expect(screen.getByTestId('toolbar-settings')).toBeInTheDocument();
  });

  it('should hide groups when corresponding props are false', () => {
    render(
      <EditorToolbar
        showFileOperations={false}
        showFormatting={false}
        showInsertOptions={false}
        showViewOptions={false}
      />
    );

    // 檔案操作按鈕應該被隱藏
    expect(screen.queryByTestId('toolbar-new')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbar-save')).not.toBeInTheDocument();

    // 格式化按鈕應該被隱藏
    expect(screen.queryByTestId('toolbar-bold')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbar-italic')).not.toBeInTheDocument();

    // 插入按鈕應該被隱藏
    expect(screen.queryByTestId('toolbar-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toolbar-image')).not.toBeInTheDocument();
  });

  it('should call onAction when buttons are clicked', () => {
    const mockOnAction = vi.fn();
    render(<EditorToolbar onAction={mockOnAction} />);

    // 測試粗體按鈕
    fireEvent.click(screen.getByTestId('toolbar-bold'));
    expect(mockOnAction).toHaveBeenCalledWith('bold');

    // 測試儲存按鈕
    fireEvent.click(screen.getByTestId('toolbar-save'));
    expect(mockOnAction).toHaveBeenCalledWith('save');
  });

  it('should disable all buttons when disabled prop is true', () => {
    render(<EditorToolbar disabled={true} />);

    const boldButton = screen.getByTestId('toolbar-bold');
    const saveButton = screen.getByTestId('toolbar-save');
    const linkButton = screen.getByTestId('toolbar-link');

    expect(boldButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
    expect(linkButton).toBeDisabled();
  });

  it('should not call onAction when disabled', () => {
    const mockOnAction = vi.fn();
    render(<EditorToolbar disabled={true} onAction={mockOnAction} />);

    fireEvent.click(screen.getByTestId('toolbar-bold'));
    expect(mockOnAction).not.toHaveBeenCalled();
  });

  it('should show active state for buttons in activeFormats', () => {
    const activeFormats: EditorAction[] = ['bold', 'italic'];
    render(<EditorToolbar activeFormats={activeFormats} />);

    const boldButton = screen.getByTestId('toolbar-bold');
    const italicButton = screen.getByTestId('toolbar-italic');
    const codeButton = screen.getByTestId('toolbar-code');

    // 應該有 active 樣式
    expect(boldButton).toHaveClass('bg-accent');
    expect(italicButton).toHaveClass('bg-accent');

    // 應該沒有 active 樣式
    expect(codeButton).not.toHaveClass('bg-accent');
  });

  it('should apply custom className', () => {
    render(<EditorToolbar className="custom-toolbar" />);

    const toolbar = screen.getByTestId('editor-toolbar');
    expect(toolbar).toHaveClass('custom-toolbar');
  });

  it('should show button tooltips on hover', () => {
    render(<EditorToolbar />);

    const boldButton = screen.getByTestId('toolbar-bold');
    expect(boldButton).toHaveAttribute('title', '粗體 (Ctrl+B)');

    const saveButton = screen.getByTestId('toolbar-save');
    expect(saveButton).toHaveAttribute('title', '儲存文件 (Ctrl+S)');
  });

  it('should have proper button icons and labels', () => {
    render(<EditorToolbar />);

    // 檢查按鈕包含圖示和文字
    const boldButton = screen.getByTestId('toolbar-bold');
    expect(boldButton).toHaveTextContent('𝐁');
    expect(boldButton).toHaveTextContent('粗體');

    const newButton = screen.getByTestId('toolbar-new');
    expect(newButton).toHaveTextContent('📄');
    expect(newButton).toHaveTextContent('新增');
  });

  it('should have separators between button groups', () => {
    render(<EditorToolbar />);

    const toolbar = screen.getByTestId('editor-toolbar');
    const separators = toolbar.querySelectorAll('.w-px.h-6.bg-border');

    // 應該有分隔線存在（具體數量取決於顯示的群組數）
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should be responsive and hide labels on small screens', () => {
    render(<EditorToolbar />);

    const boldButton = screen.getByTestId('toolbar-bold');
    const labelSpan = boldButton.querySelector('.hidden.sm\\:inline');

    expect(labelSpan).toBeInTheDocument();
    expect(labelSpan).toHaveClass('hidden', 'sm:inline');
  });
});
