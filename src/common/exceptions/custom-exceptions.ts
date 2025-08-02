import { HttpException, HttpStatus } from '@nestjs/common';

export class EmployeeNotFoundException extends HttpException {
  constructor(employeeId: number) {
    super(
      {
        message: `Employee with ID ${employeeId} not found`,
        error: 'Employee Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        employeeId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DocumentTypeNotFoundException extends HttpException {
  constructor(documentTypeId: number) {
    super(
      {
        message: `Document type with ID ${documentTypeId} not found`,
        error: 'Document Type Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        documentTypeId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DocumentNotFoundException extends HttpException {
  constructor(documentId: number) {
    super(
      {
        message: `Document with ID ${documentId} not found`,
        error: 'Document Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        documentId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateEmployeeException extends HttpException {
  constructor(document: string) {
    super(
      {
        message: `Employee with document ${document} already exists`,
        error: 'Duplicate Employee',
        statusCode: HttpStatus.CONFLICT,
        document,
        suggestion: 'Use a different document number or update the existing employee',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class DuplicateDocumentTypeException extends HttpException {
  constructor(name: string) {
    super(
      {
        message: `Document type with name "${name}" already exists`,
        error: 'Duplicate Document Type',
        statusCode: HttpStatus.CONFLICT,
        name,
        suggestion: 'Use a different name or update the existing document type',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class DocumentAlreadySubmittedException extends HttpException {
  constructor(employeeId: number, documentTypeId: number, existingDocumentId: number) {
    super(
      {
        message: 'Employee has already submitted a document for this document type',
        error: 'Document Already Submitted',
        statusCode: HttpStatus.CONFLICT,
        employeeId,
        documentTypeId,
        existingDocumentId,
        suggestion: 'Delete the existing document first or update it instead',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class AssociationNotFoundException extends HttpException {
  constructor(employeeId: number, documentTypeId: number) {
    super(
      {
        message: 'Employee is not associated with this document type',
        error: 'Association Not Found',
        statusCode: HttpStatus.BAD_REQUEST,
        employeeId,
        documentTypeId,
        suggestion: 'Associate the employee with the document type first',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AssociationAlreadyExistsException extends HttpException {
  constructor(employeeId: number, documentTypeIds: number[]) {
    super(
      {
        message: 'Employee is already associated with some of these document types',
        error: 'Association Already Exists',
        statusCode: HttpStatus.CONFLICT,
        employeeId,
        documentTypeIds,
        suggestion: 'Check existing associations before creating new ones',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidFileFormatException extends HttpException {
  constructor(fileName: string, allowedFormats: string[]) {
    super(
      {
        message: `Invalid file format for "${fileName}"`,
        error: 'Invalid File Format',
        statusCode: HttpStatus.BAD_REQUEST,
        fileName,
        allowedFormats,
        suggestion: `Please use one of the following formats: ${allowedFormats.join(', ')}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BusinessRuleViolationException extends HttpException {
  constructor(rule: string, details?: any) {
    super(
      {
        message: `Business rule violation: ${rule}`,
        error: 'Business Rule Violation',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        rule,
        details,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}