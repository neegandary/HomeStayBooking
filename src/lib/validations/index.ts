export * from './auth';
export * from './booking';

/**
 * Extract the first error message from Zod's flattened errors
 */
export function getFirstErrorMessage(flattened: {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}): string {
  // Check form-level errors first
  if (flattened.formErrors.length > 0) {
    return flattened.formErrors[0];
  }

  // Check field-level errors
  const fields = Object.keys(flattened.fieldErrors);
  if (fields.length > 0) {
    const firstField = fields[0];
    const fieldErrors = flattened.fieldErrors[firstField];
    if (fieldErrors && fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }

  return 'Validation failed';
}
