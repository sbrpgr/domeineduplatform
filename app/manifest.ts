import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '도메인 용어 백과사전',
    short_name: '용어백과',
    description: '도메인 용어 학습 플랫폼',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef6ff',
    theme_color: '#1A3C5E',
    icons: []
  };
}
