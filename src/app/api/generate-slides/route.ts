// ABOUTME: API 路由處理 AI 投影片生成請求，整合 OpenAI API
// ABOUTME: 支援自訂 baseURL、model 參數，並處理錯誤和回應格式化

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { aiGenerationRequestSchema } from '@/lib/validations';
import type { AiGenerationResponse, AiGenerationError } from '@/types/editor';

export async function POST(request: NextRequest) {
  try {
    // 解析和驗證請求資料
    const body = await request.json();
    const validatedData = aiGenerationRequestSchema.parse(body);

    const { baseUrl, apiKey, model, prompt } = validatedData;

    // 建立 OpenAI 客戶端
    const openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一個專業的教學內容創作助手。請根據用戶的要求創建高品質的 Markdown 格式投影片內容。使用 --- 作為投影片分隔符號。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    // 提取生成的內容
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI 模型未返回任何內容');
    }

    // 建構回應資料
    const response: AiGenerationResponse = {
      content,
      model: completion.model,
      ...(completion.usage && {
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      }),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI 投影片生成錯誤:', error);

    let errorResponse: AiGenerationError;

    if (error instanceof Error) {
      // OpenAI API 錯誤
      if ('status' in error && 'error' in error) {
        const openaiError = error as { status: number; error: { message?: string; code?: string } };
        errorResponse = {
          message: openaiError.error?.message || error.message,
          code: openaiError.error?.code || 'openai_error',
          status: openaiError.status,
        };
      } else {
        // 一般錯誤
        errorResponse = {
          message: error.message,
          code: 'generation_error',
        };
      }
    } else {
      // 未知錯誤
      errorResponse = {
        message: '生成過程中發生未知錯誤',
        code: 'unknown_error',
      };
    }

    // 根據錯誤類型設定適當的 HTTP 狀態碼
    let statusCode = 500;
    
    if (errorResponse.status) {
      statusCode = errorResponse.status;
    } else if (errorResponse.message.includes('API key')) {
      statusCode = 401;
    } else if (errorResponse.message.includes('quota') || errorResponse.message.includes('rate limit')) {
      statusCode = 429;
    } else if (errorResponse.message.includes('model')) {
      statusCode = 400;
    }

    return NextResponse.json(
      { error: errorResponse },
      { status: statusCode }
    );
  }
}