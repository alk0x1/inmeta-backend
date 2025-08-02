import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { Employee, DocumentType } from '@prisma/client';

export class TestUtils {
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    
    const prismaService = app.get(PrismaService);
    global.prisma = prismaService;
    
    return app;
  }

  static async createTestEmployee(prisma: PrismaService): Promise<Employee> {
    return prisma.employee.create({
      data: {
        name: 'Test Employee',
        document: '12345678901',
        hiredAt: new Date('2024-01-01'),
      },
    });
  }

  static async createTestDocumentType(prisma: PrismaService, name: string = 'Test Document'): Promise<DocumentType> {
    return prisma.documentType.create({
      data: {
        name,
      },
    });
  }

  static async createEmployeeWithDocumentTypes(
    prisma: PrismaService,
    employeeData?: Partial<Employee>,
    documentTypeNames: string[] = ['CPF', 'RG']
  ) {
    const employee = await prisma.employee.create({
      data: {
        name: 'Test Employee',
        document: '12345678901',
        hiredAt: new Date('2024-01-01'),
        ...employeeData,
      },
    });

    const documentTypes = await Promise.all(
      documentTypeNames.map(name =>
        prisma.documentType.create({
          data: { name },
        })
      )
    );

    await Promise.all(
      documentTypes.map(docType =>
        prisma.employeeDocumentType.create({
          data: {
            employeeId: employee.id,
            documentTypeId: docType.id,
          },
        })
      )
    );

    return { employee, documentTypes };
  }

  static generateValidCPF(): string {
    const cpfArray = [];
    
    for (let i = 0; i < 9; i++) {
      cpfArray.push(Math.floor(Math.random() * 9));
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += cpfArray[i] * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    cpfArray.push(firstDigit);
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += cpfArray[i] * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;
    cpfArray.push(secondDigit);
    
    return cpfArray.join('');
  }

  static async cleanDatabase(prisma: PrismaService): Promise<void> {
    await prisma.document.deleteMany({});
    await prisma.employeeDocumentType.deleteMany({});
    await prisma.documentType.deleteMany({});
    await prisma.employee.deleteMany({});
  }
}