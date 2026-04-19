/**
 * Validation Schemas
 * Usati sia lato client (per feedback immediato) che lato server (per sicurezza).
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validazione Device
export const deviceSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_àèéìòù]+$/i,
  },
  type: {
    required: true,
    enum: ['light', 'thermostat', 'humidity', 'blinds', 'plug'],
  },
  room_id: {
    required: true,
    type: 'number',
    min: 1,
  },
  value: {
    type: 'number',
    min: 0,
    max: 100,
  },
};

// Validazione Reading
export const createReadingSchema = {
  device_id: {
    required: true,
    type: 'number',
  },
  value: {
    required: true,
    type: 'number',
  },
  // aggiungi altri campi se necessari
};

// Validazione Alert
export const createAlertSchema = {
  message: {
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  type: {
    required: true,
    enum: ['info', 'warning', 'error', 'success'],
  },
  // aggiungi altri campi se necessari, ad esempio device_id
};

// Validazione Room
export const roomSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_àèéìòù]+$/i,
  },
  icon: {
    required: true,
    enum: ['living', 'kitchen', 'bed', 'bathroom', 'yard', 'garage', 'office'],
  },
};

// Validazione Automation
export const automationSchema = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  trigger_device_id: {
    required: true,
    type: 'number',
  },
  trigger_condition: {
    required: true,
    enum: ['on', 'off', 'above', 'below', 'equals'],
  },
  trigger_value: {
    type: 'number',
  },
  action_device_ids: {
    required: true,
    type: 'array',
    minItems: 1,
  },
  action_type: {
    required: true,
    enum: ['toggle', 'set_value', 'turn_on', 'turn_off'],
  },
};

export const loginSchema = {
  email: {
    required: true,
    minLength: 5,
    maxLength: 100,
  },
  password: {
    required: true,
    minLength: 4,
  },
};

export const updateAlertSchema = {
  is_active: {
    required: true,
    type: 'number',
    enum: [0, 1],
  },
};

/**
 * Valida un oggetto contro uno schema
 */
export function validate(data: any, schema: any): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldRules = rules as any;

    // Required
    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} è obbligatorio`,
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type
    if (fieldRules.type === 'number' && typeof value !== 'number') {
      errors.push({
        field,
        message: `${field} deve essere un numero`,
      });
    }

    if (fieldRules.type === 'array' && !Array.isArray(value)) {
      errors.push({
        field,
        message: `${field} deve essere un array`,
      });
    }

    // String validations
    if (typeof value === 'string') {
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors.push({
          field,
          message: `${field} deve avere almeno ${fieldRules.minLength} caratteri`,
        });
      }

      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors.push({
          field,
          message: `${field} non può superare ${fieldRules.maxLength} caratteri`,
        });
      }

      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} contiene caratteri non validi`,
        });
      }
    }

    // Enum
    if (fieldRules.enum && !fieldRules.enum.includes(value)) {
      errors.push({
        field,
        message: `${field} deve essere uno di: ${fieldRules.enum.join(', ')}`,
      });
    }

    // Number validations
    if (typeof value === 'number') {
      if (fieldRules.min !== undefined && value < fieldRules.min) {
        errors.push({
          field,
          message: `${field} deve essere almeno ${fieldRules.min}`,
        });
      }

      if (fieldRules.max !== undefined && value > fieldRules.max) {
        errors.push({
          field,
          message: `${field} non può superare ${fieldRules.max}`,
        });
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      if (fieldRules.minItems && value.length < fieldRules.minItems) {
        errors.push({
          field,
          message: `${field} deve contenere almeno ${fieldRules.minItems} elemento/i`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formatta gli errori di validazione per la risposta HTTP
 */
export function formatValidationErrors(errors: ValidationError[]) {
  return {
    error: 'Validation failed',
    details: errors,
    status: 400,
  };
}
