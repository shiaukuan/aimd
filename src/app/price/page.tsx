// ABOUTME: 捐款支持頁面，展示 QR Code 和捐款資訊
// ABOUTME: 使用卡片式設計，提供清晰的捐款方式和感謝訊息

import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export default function PricePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-border/50 backdrop-blur-sm bg-card/80">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                捐款支持
              </CardTitle>
              <CardDescription>
                您的支持是我們持續改進的動力
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* QR Code 圖片 */}
              <div className="flex justify-center">
                <div className="relative w-52 h-52 rounded-lg overflow-hidden border border-border/30 shadow-md">
                  <Image
                    src="/images/qrcode-donate.png"
                    alt="捐款 QR Code"
                    width={200}
                    height={200}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* 捐款連結 */}
              <div className="flex justify-center">
                <Link
                  href="https://p.ecpay.com.tw/500617F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                >
                  前往捐款頁面
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              {/* 感謝文字 */}
              <div className="text-center space-y-2 pt-4 border-t border-border/30">
                <p className="text-muted-foreground text-sm">
                  感謝 10 元捐款支持
                </p>
                <p className="text-xs text-muted-foreground/80">
                  您的每一份心意都將用於改善產品體驗
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
