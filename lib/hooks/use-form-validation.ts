/**
 * Hook React: useFormValidation
 * Gestisce la validazione dei form lato client con feedback in tempo reale.
 */

import { useState, useCallback } from 'react';
import { validate, ValidationError } from '@/lib/validation';

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
}

export function useFormValidation(initialValues: Record<string, any>, schema: any) {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
  });

  const validateField = useCallback(
    (fieldName: string, value: any) => {
      const fieldSchema = { [fieldName]: schema[fieldName] };
      const result = validate({ [fieldName]: value }, fieldSchema);

      if (result.errors.length > 0) {
        return result.errors[0].message;
      }
      return '';
    },
    [schema]
  );

  const setFieldValue = useCallback(
    (fieldName: string, value: any) => {
      setState(prev => {
        const newValues = { ...prev.values, [fieldName]: value };
        const error = validateField(fieldName, value);
        const newErrors = { ...prev.errors };

        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }

        // Valida l'intero form
        const fullValidation = validate(newValues, schema);
        const isValid = fullValidation.valid;

        return {
          values: newValues,
          errors: newErrors,
          touched: { ...prev.touched, [fieldName]: true },
          isValid,
          isDirty: true,
        };
      });
    },
    [validateField, schema]
  );

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: isTouched },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    });
  }, [initialValues]);

  const validateForm = useCallback(() => {
    const result = validate(state.values, schema);
    const newErrors: Record<string, string> = {};

    result.errors.forEach(err => {
      newErrors[err.field] = err.message;
    });

    setState(prev => ({
      ...prev,
      errors: newErrors,
      isValid: result.valid,
    }));

    return result.valid;
  }, [state.values, schema]);

  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: state.values[fieldName] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: () => setFieldTouched(fieldName, true),
      error: state.touched[fieldName] ? state.errors[fieldName] : '',
    }),
    [state.values, state.errors, state.touched, setFieldValue, setFieldTouched]
  );

  return {
    ...state,
    setFieldValue,
    setFieldTouched,
    resetForm,
    validateForm,
    getFieldProps,
  };
}
