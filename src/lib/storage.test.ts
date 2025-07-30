import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStorageItem, setStorageItem, removeStorageItem } from './storage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),  
};

vi.stubGlobal('localStorage', localStorageMock);

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageItem', () => {
    it('should return parsed item from localStorage', () => {
      const testData = { width: 50 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));
      
      const result = getStorageItem('test-key', { width: 25 });
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return default value when item does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getStorageItem('test-key', { width: 25 });
      
      expect(result).toEqual({ width: 25 });
    });

    it('should return default value when JSON parsing fails', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = getStorageItem('test-key', { width: 25 });
      
      expect(result).toEqual({ width: 25 });
    });

    it('should return default value in SSR environment', () => {
      vi.stubGlobal('window', undefined);
      
      const result = getStorageItem('test-key', { width: 25 });
      
      expect(result).toEqual({ width: 25 });
      
      // Restore window
      vi.stubGlobal('window', { localStorage: localStorageMock });
    });
  });

  describe('setStorageItem', () => {
    it('should set item in localStorage', () => {
      const testData = { width: 50 };
      
      setStorageItem('test-key', testData);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      expect(() => setStorageItem('test-key', { width: 50 })).not.toThrow();
    });

    it('should do nothing in SSR environment', () => {
      vi.stubGlobal('window', undefined);
      
      setStorageItem('test-key', { width: 50 });
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      
      // Restore window
      vi.stubGlobal('window', { localStorage: localStorageMock });
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from localStorage', () => {
      removeStorageItem('test-key');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Access denied');
      });
      
      expect(() => removeStorageItem('test-key')).not.toThrow();
    });

    it('should do nothing in SSR environment', () => {
      vi.stubGlobal('window', undefined);
      
      removeStorageItem('test-key');
      
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      
      // Restore window  
      vi.stubGlobal('window', { localStorage: localStorageMock });
    });
  });
});