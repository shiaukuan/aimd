// ABOUTME: AI 投影片生成面板組件，提供 OpenAI API 設定和生成功能
// ABOUTME: 支援自訂 baseURL、apiKey、model 參數，並可儲存設定到 localStorage

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleEncryption } from '@/lib/crypto';
import { aiGenerationSettingsSchema, type AiGenerationSettings } from '@/lib/validations';
import type { AiGenerationPanelProps, AiGenerationError } from '@/types/editor';
import { toast } from 'sonner';

const STORAGE_KEY = 'ai-generation-settings';

export const AiGenerationPanel: React.FC<AiGenerationPanelProps> = ({
  onGenerate,
  isGenerating: propIsGenerating = false,
  className,
  onError,
}) => {
  const [settings, setSettings] = useState<AiGenerationSettings>({
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    prompt: '生成pytest教學 markdown 格式教學簡報 用 換行 --- 當作換頁',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AiGenerationSettings, string>>>({});
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [useServerConfig, setUseServerConfig] = useState(false);
  
  const isGenerating = propIsGenerating || isLocalGenerating;

  // 載入儲存的設定
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const decryptedSettings = {
          ...parsed,
          apiKey: parsed.apiKey ? SimpleEncryption.decode(parsed.apiKey) : '',
        };
        setSettings(prev => ({ ...prev, ...decryptedSettings }));
        setUseServerConfig(parsed.useServerConfig || false);
      }
    } catch (error) {
      console.warn('無法載入儲存的 AI 設定:', error);
    }
  }, []);

  // 儲存設定到 localStorage（API 金鑰加密）
  const saveSettings = useCallback((newSettings: AiGenerationSettings, serverConfig: boolean = useServerConfig) => {
    try {
      const settingsToSave = {
        ...newSettings,
        apiKey: newSettings.apiKey ? SimpleEncryption.encode(newSettings.apiKey) : '',
        useServerConfig: serverConfig,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.warn('無法儲存 AI 設定:', error);
    }
  }, [useServerConfig]);

  // 處理輸入變更
  const handleInputChange = useCallback((field: keyof AiGenerationSettings, value: string) => {
    // 清除不可見字符，特別是零寬度空格 (ZWSP)
    const cleanValue = value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const newSettings = { ...settings, [field]: cleanValue };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [settings, saveSettings, errors]);

  // 切換伺服器設定模式
  const handleServerConfigToggle = useCallback((enabled: boolean) => {
    setUseServerConfig(enabled);
    saveSettings(settings, enabled);
  }, [settings, saveSettings]);


  // 處理生成
  const handleGenerate = useCallback(async () => {
    // 驗證設定
    const validateSettings = (): boolean => {
      try {
        aiGenerationSettingsSchema.parse(settings);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          const validationErrors = error as { errors?: Array<{ path?: string[]; message: string }> };
          const newErrors: Partial<Record<keyof AiGenerationSettings, string>> = {};
          
          validationErrors.errors?.forEach((err) => {
            if (err.path && err.path.length > 0) {
              newErrors[err.path[0] as keyof AiGenerationSettings] = err.message;
            }
          });
          
          setErrors(newErrors);
        }
        return false;
      }
    };

    if (!validateSettings()) {
      toast.error('請修正表單錯誤後再試');
      return;
    }

    setIsLocalGenerating(true);

    try {
      const requestBody = useServerConfig 
        ? { prompt: settings.prompt }
        : settings;

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: 生成失敗`);
      }

      const data = await response.json();
      onGenerate(data.content);
      toast.success('投影片內容生成成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      const aiError: AiGenerationError = {
        message: errorMessage,
        ...(error instanceof Error && 'status' in error && { status: (error as { status: number }).status }),
      };
      
      onError?.(aiError);
      toast.error(`生成失敗: ${errorMessage}`);
    } finally {
      setIsLocalGenerating(false);
    }
  }, [settings, useServerConfig, onGenerate, onError]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI 投影片生成
          <Shield className="h-4 w-4 text-green-600" />
        </CardTitle>
        <CardDescription>
          安全的 AI 投影片生成工具 - 您的 API 金鑰經過加密保護
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 安全模式切換 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">使用伺服器設定</span>
          </div>
          <Button
            variant={useServerConfig ? "default" : "outline"}
            size="sm"
            onClick={() => handleServerConfigToggle(!useServerConfig)}
            disabled={isGenerating}
          >
            {useServerConfig ? "已啟用" : "啟用"}
          </Button>
        </div>

        {/* 安全提示 */}
        {!useServerConfig && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">安全提醒</p>
              <p>您的 API 金鑰將在瀏覽器中加密儲存，僅用於生成投影片。我們不會上傳您的金鑰到伺服器。</p>
            </div>
          </div>
        )}

        {!useServerConfig && (
          <>
            {/* Base URL */}
            <div className="space-y-2">
              <Label htmlFor="baseUrl" className="flex items-center gap-2">
                API Base URL
                <Shield className="h-3 w-3 text-green-600" />
              </Label>
              <Input
                id="baseUrl"
                type="url"
                placeholder="https://api.openai.com/v1"
                value={settings.baseUrl}
                onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                disabled={isGenerating}
                className="font-mono text-sm"
              />
              {errors.baseUrl && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.baseUrl}
                </div>
              )}
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                API 金鑰
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">(加密儲存)</span>
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-... 或 github_pat_..."
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  disabled={isGenerating}
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={isGenerating}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.apiKey && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.apiKey}
                </div>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">AI 模型</Label>
              <Input
                id="model"
                placeholder="gpt-3.5-turbo"
                value={settings.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                disabled={isGenerating}
                className="font-mono text-sm"
              />
              {errors.model && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.model}
                </div>
              )}
            </div>
          </>
        )}

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">生成指令</Label>
          <Textarea
            id="prompt"
            placeholder="請輸入要生成的投影片內容描述..."
            value={settings.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            disabled={isGenerating}
            rows={4}
            className="resize-none"
          />
          {errors.prompt && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.prompt}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              生成投影片
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};