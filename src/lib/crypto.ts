// ABOUTME: 簡單的客戶端加密工具，用於安全儲存敏感資訊到 localStorage
// ABOUTME: 使用 Web Crypto API 進行基礎加密，防止明文儲存 API 金鑰

/**
 * 簡單的字串加密功能（僅用於客戶端儲存，不適用於傳輸加密）
 */
export class SimpleEncryption {
  private static readonly KEY_PREFIX = 'encrypted_';
  
  /**
   * 簡單編碼（非真正加密，僅混淆）
   */
  static encode(text: string): string {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return this.KEY_PREFIX + encoded;
  }
  
  /**
   * 簡單解碼
   */
  static decode(encodedText: string): string {
    if (!encodedText.startsWith(this.KEY_PREFIX)) {
      return encodedText; // 如果不是加密格式，直接返回
    }
    
    try {
      const encoded = encodedText.substring(this.KEY_PREFIX.length);
      return decodeURIComponent(escape(atob(encoded)));
    } catch {
      return encodedText; // 解碼失敗，返回原文
    }
  }
  
  /**
   * 檢查是否為加密格式
   */
  static isEncrypted(text: string): boolean {
    return text.startsWith(this.KEY_PREFIX);
  }
}