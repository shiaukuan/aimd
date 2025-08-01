import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from './MarkdownEditor';

describe('MarkdownEditor', () => {
  it('should render with basic structure', () => {
    render(<MarkdownEditor value="" onChange={() => {}} />);

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('line-numbers')).toBeInTheDocument();
    expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();
  });

  it('should display initial value', () => {
    const initialValue = '# Hello World\n\nThis is a test.';
    render(<MarkdownEditor value={initialValue} onChange={() => {}} />);

    const textarea = screen.getByTestId(
      'editor-textarea'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(initialValue);
  });

  it('should show line numbers correctly', () => {
    const multilineValue = 'Line 1\nLine 2\nLine 3';
    render(<MarkdownEditor value={multilineValue} onChange={() => {}} />);

    const lineNumbers = screen.getByTestId('line-numbers');
    expect(lineNumbers.textContent).toContain('1');
    expect(lineNumbers.textContent).toContain('2');
    expect(lineNumbers.textContent).toContain('3');
  });

  it('should call onChange when content changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<MarkdownEditor value="" onChange={mockOnChange} />);

    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, 'H');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('H');
    });
  });

  it('should handle Tab key for indentation', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<MarkdownEditor value="test" onChange={mockOnChange} />);

    const textarea = screen.getByTestId(
      'editor-textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 0);
    textarea.focus();

    await user.keyboard('{Tab}');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('  test');
    });
  });

  it('should handle Shift+Tab for unindenting', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<MarkdownEditor value="  test" onChange={mockOnChange} />);

    const textarea = screen.getByTestId(
      'editor-textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 0);
    textarea.focus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  it('should use placeholder when value is empty', () => {
    const placeholder = '請輸入 Markdown 內容...';
    render(
      <MarkdownEditor value="" onChange={() => {}} placeholder={placeholder} />
    );

    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('placeholder', placeholder);
  });

  it('should be read-only when readOnly prop is true', () => {
    render(<MarkdownEditor value="test" onChange={() => {}} readOnly={true} />);

    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('readonly');
  });

  it('should call onKeyDown callback', async () => {
    const user = userEvent.setup();
    const mockOnKeyDown = vi.fn();

    render(
      <MarkdownEditor value="" onChange={() => {}} onKeyDown={mockOnKeyDown} />
    );

    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, 'a');

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  it('should call onSelect callback', () => {
    const mockOnSelect = vi.fn();

    render(
      <MarkdownEditor
        value="test content"
        onChange={() => {}}
        onSelect={mockOnSelect}
      />
    );

    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.select(textarea);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <MarkdownEditor value="" onChange={() => {}} className="custom-editor" />
    );

    const editor = screen.getByTestId('markdown-editor');
    expect(editor).toHaveClass('custom-editor');
  });

  it('should apply custom style', () => {
    const customStyle = { fontSize: '16px' };
    render(<MarkdownEditor value="" onChange={() => {}} style={customStyle} />);

    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveStyle('font-size: 16px');
  });

  it('should handle composition events for IME input', async () => {
    const mockOnChange = vi.fn();

    render(<MarkdownEditor value="" onChange={mockOnChange} />);

    const textarea = screen.getByTestId('editor-textarea');

    // 模擬輸入法組合開始
    fireEvent.compositionStart(textarea);
    fireEvent.change(textarea, { target: { value: '測' } });

    // 在組合期間也會觸發 onChange
    expect(mockOnChange).toHaveBeenCalledWith('測');

    // 組合結束
    fireEvent.compositionEnd(textarea, { target: { value: '測試' } });
    fireEvent.change(textarea, { target: { value: '測試' } });

    expect(mockOnChange).toHaveBeenLastCalledWith('測試');
  });

  it('should have proper accessibility attributes', () => {
    render(<MarkdownEditor value="test" onChange={() => {}} />);

    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('spellCheck', 'false');
    expect(textarea).toHaveAttribute('autoComplete', 'off');
    expect(textarea).toHaveAttribute('autoCorrect', 'off');
    expect(textarea).toHaveAttribute('autoCapitalize', 'off');
  });

  it('should prevent Tab default behavior and handle indentation', async () => {
    const mockOnChange = vi.fn();

    render(<MarkdownEditor value="test" onChange={mockOnChange} />);

    const textarea = screen.getByTestId(
      'editor-textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 0);
    textarea.focus();

    // 模擬 Tab 鍵按下
    fireEvent.keyDown(textarea, {
      key: 'Tab',
      code: 'Tab',
      charCode: 9,
      keyCode: 9,
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('  test');
    });
  });
});
