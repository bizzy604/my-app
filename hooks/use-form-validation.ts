import { useState } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: any) => boolean | string
}

interface ValidationRules {
  [key: string]: ValidationRule
}

export function useFormValidation<T extends { [key: string]: any }>(
  initialState: T,
  validationRules: ValidationRules
) {
  const [formData, setFormData] = useState<T>(initialState)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const validateField = (name: string, value: any) => {
    const rules = validationRules[name]
    if (!rules) return ''

    if (rules.required && !value) {
      return `${name} is required`
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name} must be less than ${rules.maxLength} characters`
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${name} format is invalid`
    }

    if (rules.validate) {
      const result = rules.validate(value)
      if (typeof result === 'string') return result
      if (!result) return `${name} is invalid`
    }

    return ''
  }

  const handleChange = (name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    const error = validateField(name as string, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name as string, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    setFormData
  }
} 