import { validate } from 'class-validator';
import { IsCPF } from './cpf.validator';

class TestClass {
  @IsCPF()
  cpf: string;
}

describe('CPF Validator', () => {
  let testInstance: TestClass;

  beforeEach(() => {
    testInstance = new TestClass();
  });

  describe('valid CPFs', () => {
    it('should accept valid CPF: 11144477735', async () => {
      testInstance.cpf = '11144477735';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid CPF: 52998224725', async () => {
      testInstance.cpf = '52998224725';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should accept CPF with formatting: 111.444.777-35', async () => {
      testInstance.cpf = '111.444.777-35';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid CPFs', () => {
    it('should reject CPF with wrong length', async () => {
      testInstance.cpf = '123456789';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isCPF).toBe('Invalid CPF format');
    });

    it('should reject CPF with all same digits', async () => {
      testInstance.cpf = '11111111111';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isCPF).toBe('Invalid CPF format');
    });

    it('should reject CPF with invalid check digits', async () => {
      testInstance.cpf = '12345678900';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isCPF).toBe('Invalid CPF format');
    });

    it('should reject non-string values', async () => {
      testInstance.cpf = 123 as any;
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
    });

    it('should reject empty string', async () => {
      testInstance.cpf = '';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
    });

    it('should reject CPF with letters', async () => {
      testInstance.cpf = '1234567890a';
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isCPF).toBe('Invalid CPF format');
    });
  });
});