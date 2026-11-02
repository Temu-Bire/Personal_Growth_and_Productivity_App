export class DatabaseError extends Error {
  public readonly originalError?: unknown;
  public readonly query?: string;

  constructor(message: string, query?: string, originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.query = query;
    this.originalError = originalError;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class MigrationError extends DatabaseError {
  public readonly fromVersion: number;
  public readonly targetVersion: number;

  constructor(
    message: string,
    fromVersion: number,
    targetVersion: number,
    originalError?: unknown
  ) {
    super(
      `Migration failed from version ${fromVersion} to ${targetVersion}: ${message}`,
      undefined,
      originalError
    );
    this.name = 'MigrationError';
    this.fromVersion = fromVersion;
    this.targetVersion = targetVersion;
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, originalError?: unknown) {
    super(`Transaction aborted: ${message}`, undefined, originalError);
    this.name = 'TransactionError';
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}
