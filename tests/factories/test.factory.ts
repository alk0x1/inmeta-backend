import { CreateEmployeeDto } from '../../src/modules/employee/dto/create-employee.dto';
import { CreateDocumentTypeDto } from '../../src/modules/document-type/dto/create-document-type.dto';
import { CreateDocumentDto } from '../../src/modules/document/dto/create-document.dto';
import { TestUtils } from '../../src/utils/test-utils';

export class TestFactory {
  static createEmployeeDto(overrides?: Partial<CreateEmployeeDto>): CreateEmployeeDto {
    return {
      name: 'João Silva',
      document: TestUtils.generateValidCPF(),
      hiredAt: '2024-01-01',
      ...overrides,
    };
  }

  static createDocumentTypeDto(overrides?: Partial<CreateDocumentTypeDto>): CreateDocumentTypeDto {
    return {
      name: 'CPF',
      ...overrides,
    };
  }

  static createDocumentDto(documentTypeId: number, overrides?: Partial<CreateDocumentDto>): CreateDocumentDto {
    return {
      documentTypeId,
      name: 'document.pdf',
      ...overrides,
    };
  }

  static createMultipleEmployees(count: number): CreateEmployeeDto[] {
    return Array.from({ length: count }, (_, index) => ({
      name: `Employee ${index + 1}`,
      document: TestUtils.generateValidCPF(),
      hiredAt: '2024-01-01',
    }));
  }

  static createMultipleDocumentTypes(names: string[]): CreateDocumentTypeDto[] {
    return names.map(name => ({ name }));
  }

  static getInvalidEmployeeData() {
    return {
      emptyName: { name: '', document: '12345678901', hiredAt: '2024-01-01' },
      invalidCPF: { name: 'Test', document: '123', hiredAt: '2024-01-01' },
      futureDate: { name: 'Test', document: '12345678901', hiredAt: '2025-12-31' },
      invalidDate: { name: 'Test', document: '12345678901', hiredAt: 'invalid-date' },
    };
  }

  static getInvalidDocumentTypeData() {
    return {
      emptyName: { name: '' },
      tooLongName: { name: 'a'.repeat(51) },
      invalidCharacters: { name: 'Document@#$%' },
    };
  }
}