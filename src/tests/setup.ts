import { PrismaService } from '../../prisma/prisma.service';

declare global {
  var prisma: PrismaService;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/employee_docs_test?schema=public';
});

beforeEach(async () => {
  if (global.prisma) {
    await global.prisma.cleanDatabase();
  }
});

afterAll(async () => {
  if (global.prisma) {
    await global.prisma.$disconnect();
  }
});