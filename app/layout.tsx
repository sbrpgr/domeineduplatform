import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/app/providers';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: '도메인 용어 백과사전',
  description: 'AI 시대, 언어가 곧 실행력이다. 실무 도메인 용어 학습 플랫폼'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
