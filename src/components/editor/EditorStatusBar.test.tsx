import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorStatusBar } from './EditorStatusBar';
import { EditorStats } from '@/types/editor';

const mockStats: EditorStats = {
  characters: 150,
  charactersNoSpaces: 120,
  words: 25,
  lines: 5,
  selectedText: '',
  selectedLength: 0,
  cursorLine: 3,
  cursorColumn: 15
};

describe('EditorStatusBar', () => {
  it('should render basic stats information', () => {
    render(<EditorStatusBar stats={mockStats} />);
    
    expect(screen.getByTestId('editor-status-bar')).toBeInTheDocument();
    
    // 檢查游標位置
    expect(screen.getByTestId('stats-lines')).toHaveTextContent('第 3 行');
    expect(screen.getByTestId('stats-column')).toHaveTextContent('第 15 列');
    
    // 檢查文字統計
    expect(screen.getByTestId('stats-words')).toHaveTextContent('25 字');
    expect(screen.getByTestId('stats-characters')).toHaveTextContent('150 字元');
    expect(screen.getByTestId('stats-lines-total')).toHaveTextContent('5 行');
  });

  it('should show detailed stats when showDetailedStats is true', () => {
    render(<EditorStatusBar stats={mockStats} showDetailedStats={true} />);
    
    expect(screen.getByTestId('stats-words')).toBeInTheDocument();
    expect(screen.getByTestId('stats-characters')).toBeInTheDocument();
    expect(screen.getByTestId('stats-lines-total')).toBeInTheDocument();
  });

  it('should hide detailed stats when showDetailedStats is false', () => {
    render(<EditorStatusBar stats={mockStats} showDetailedStats={false} />);
    
    expect(screen.queryByTestId('stats-words')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stats-characters')).not.toBeInTheDocument();
  });

  it('should show selected text stats when text is selected', () => {
    const statsWithSelection: EditorStats = {
      ...mockStats,
      selectedText: 'Hello World',
      selectedLength: 11
    };
    
    render(<EditorStatusBar stats={statsWithSelection} />);
    
    expect(screen.getByTestId('stats-selected')).toHaveTextContent('11 字元');
    expect(screen.getByText('已選取:')).toBeInTheDocument();
  });

  it('should not show selected text stats when no text is selected', () => {
    render(<EditorStatusBar stats={mockStats} />);
    
    expect(screen.queryByTestId('stats-selected')).not.toBeInTheDocument();
    expect(screen.queryByText('已選取:')).not.toBeInTheDocument();
  });

  it('should show modified indicator when isModified is true', () => {
    render(<EditorStatusBar stats={mockStats} isModified={true} />);
    
    const indicator = screen.getByTestId('modified-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-orange-500');
    expect(indicator).toHaveAttribute('title', '文件已修改');
  });

  it('should not show modified indicator when isModified is false', () => {
    render(<EditorStatusBar stats={mockStats} isModified={false} />);
    
    expect(screen.queryByTestId('modified-indicator')).not.toBeInTheDocument();
  });

  it('should show "未儲存" when lastSaved is null', () => {
    render(<EditorStatusBar stats={mockStats} lastSaved={null} />);
    
    expect(screen.getByTestId('save-status')).toHaveTextContent('未儲存');
  });

  it('should show "剛剛儲存" for recent saves', () => {
    const recentDate = new Date(Date.now() - 10000); // 10 seconds ago
    render(<EditorStatusBar stats={mockStats} lastSaved={recentDate} />);
    
    expect(screen.getByTestId('save-status')).toHaveTextContent('剛剛儲存');
  });

  it('should show minutes ago for saves within an hour', () => {
    const minutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    render(<EditorStatusBar stats={mockStats} lastSaved={minutesAgo} />);
    
    expect(screen.getByTestId('save-status')).toHaveTextContent('5分鐘前儲存');
  });

  it('should show hours ago for saves within a day', () => {
    const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    render(<EditorStatusBar stats={mockStats} lastSaved={hoursAgo} />);
    
    expect(screen.getByTestId('save-status')).toHaveTextContent('3小時前儲存');
  });

  it('should format large numbers with localization', () => {
    const largeStats: EditorStats = {
      ...mockStats,
      characters: 12345,
      words: 1234,
      lines: 567
    };
    
    render(<EditorStatusBar stats={largeStats} />);
    
    expect(screen.getByTestId('stats-words')).toHaveTextContent('1,234 字');
    expect(screen.getByTestId('stats-characters')).toHaveTextContent('12,345 字元');
    expect(screen.getByTestId('stats-lines-total')).toHaveTextContent('567 行');
  });

  it('should apply custom className', () => {
    render(<EditorStatusBar stats={mockStats} className="custom-status" />);
    
    const statusBar = screen.getByTestId('editor-status-bar');
    expect(statusBar).toHaveClass('custom-status');
  });

  it('should show file type as Markdown', () => {
    render(<EditorStatusBar stats={mockStats} />);
    
    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });

  it('should handle single line documents correctly', () => {
    const singleLineStats: EditorStats = {
      ...mockStats,
      lines: 1
    };
    
    render(<EditorStatusBar stats={singleLineStats} showDetailedStats={true} />);
    
    // 當只有一行時，不應該顯示總行數
    expect(screen.queryByTestId('stats-lines-total')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<EditorStatusBar stats={mockStats} />);
    
    const statusBar = screen.getByTestId('editor-status-bar');
    expect(statusBar).toHaveClass('text-muted-foreground');
    expect(statusBar).toHaveClass('text-xs');
  });
});