import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domainData = [
    { slug: 'it-dev', nameKo: 'IT 개발', nameEn: 'IT Development', priority: 'P1', targetTermCount: 500 },
    { slug: 'design', nameKo: '디자인', nameEn: 'Design', priority: 'P1', targetTermCount: 220 }
  ];

  for (const domain of domainData) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: domain,
      create: domain
    });
  }

  const passwordHash = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where: { email: 'demo@domain-glossary.com' },
    update: {
      name: 'Demo User',
      passwordHash,
      authProvider: 'email'
    },
    create: {
      name: 'Demo User',
      email: 'demo@domain-glossary.com',
      passwordHash,
      authProvider: 'email'
    }
  });

  const itDomain = await prisma.domain.findUnique({ where: { slug: 'it-dev' } });
  const designDomain = await prisma.domain.findUnique({ where: { slug: 'design' } });

  if (itDomain) {
    await prisma.term.upsert({
      where: { slug: 'modal' },
      update: {
        termKo: '모달',
        termEn: 'Modal',
        pronunciation: '모달 (Modal)',
        oneLineDefinition: '현재 작업을 잠시 중단시키고 위에 띄우는 UI 팝업',
        difficulty: 'beginner',
        domainId: itDomain.id
      },
      create: {
        slug: 'modal',
        termKo: '모달',
        termEn: 'Modal',
        pronunciation: '모달 (Modal)',
        oneLineDefinition: '현재 작업을 잠시 중단시키고 위에 띄우는 UI 팝업',
        difficulty: 'beginner',
        domainId: itDomain.id,
        tags: ['UI', '컴포넌트']
      }
    });
  }

  if (designDomain) {
    await prisma.term.upsert({
      where: { slug: 'design-system' },
      update: {
        termKo: '디자인 시스템',
        termEn: 'Design System',
        pronunciation: '디자인 시스템 (Design System)',
        oneLineDefinition: 'UI 일관성과 재사용성을 위한 규칙/자산 체계',
        difficulty: 'beginner',
        domainId: designDomain.id
      },
      create: {
        slug: 'design-system',
        termKo: '디자인 시스템',
        termEn: 'Design System',
        pronunciation: '디자인 시스템 (Design System)',
        oneLineDefinition: 'UI 일관성과 재사용성을 위한 규칙/자산 체계',
        difficulty: 'beginner',
        domainId: designDomain.id,
        tags: ['디자인', '시스템']
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
