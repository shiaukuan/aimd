// ABOUTME: AI 投影片生成面板組件，提供 OpenAI API 設定和生成功能
// ABOUTME: 支援自訂 baseURL、apiKey、model 參數，並可儲存設定到 localStorage

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    model: 'gpt-4o',
    prompt: '生成pytest教學 markdown 格式教學簡報 用 換行 --- 當作換頁',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AiGenerationSettings, string>>>({});
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);
  
  const isGenerating = propIsGenerating || isLocalGenerating;

  // 載入儲存的設定
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('無法載入儲存的 AI 設定:', error);
    }
  }, []);

  // 儲存設定到 localStorage
  const saveSettings = useCallback((newSettings: AiGenerationSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('無法儲存 AI 設定:', error);
    }
  }, []);

  // 處理輸入變更
  const handleInputChange = useCallback((field: keyof AiGenerationSettings, value: string) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [settings, saveSettings, errors]);

  // 驗證設定
  const validateSettings = useCallback((): boolean => {
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
  }, [settings]);

  // 處理生成
  const handleGenerate = useCallback(async () => {
    if (!validateSettings()) {
      toast.error('請修正表單錯誤後再試');
      return;
    }

    setIsLocalGenerating(true);

    try {
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
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
  }, [settings, validateSettings, onGenerate, onError]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI 投影片生成
        </CardTitle>
        <CardDescription>
          使用 AI 生成 Markdown 格式的投影片內容
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base URL */}
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            type="url"
            placeholder="https://api.openai.com/v1"
            value={settings.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
            disabled={isGenerating}
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
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={settings.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            disabled={isGenerating}
          />
          {errors.apiKey && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.apiKey}
            </div>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">模型</Label>
          <Input
            id="model"
            placeholder="gpt-4o"
            value={settings.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            disabled={isGenerating}
          />
          {errors.model && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.model}
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt">指令</Label>
          <Textarea
            id="prompt"
            placeholder="請輸入生成指令..."
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