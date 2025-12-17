// Composable สำหรับ Form Validation Rules
export const useFormValidation = () => {
  // กฎการตรวจสอบทั่วไป
  const required = (message = 'กรุณากรอกข้อมูล') => {
    return (v) => !!v || message
  }

  const requiredNumber = (message = 'กรุณากรอกตัวเลข') => {
    return (v) => (v !== null && v !== undefined && v !== '') || message
  }

  const email = (message = 'รูปแบบอีเมลไม่ถูกต้อง') => {
    return (v) => !v || /.+@.+\..+/.test(v) || message
  }

  const minLength = (min, message = null) => {
    const msg = message || `ต้องมีอย่างน้อย ${min} ตัวอักษร`
    return (v) => !v || v.length >= min || msg
  }

  const maxLength = (max, message = null) => {
    const msg = message || `ต้องไม่เกิน ${max} ตัวอักษร`
    return (v) => !v || v.length <= max || msg
  }

  const min = (minValue, message = null) => {
    const msg = message || `ต้องมากกว่าหรือเท่ากับ ${minValue}`
    return (v) => v === null || v === undefined || v === '' || v >= minValue || msg
  }

  const max = (maxValue, message = null) => {
    const msg = message || `ต้องน้อยกว่าหรือเท่ากับ ${maxValue}`
    return (v) => v === null || v === undefined || v === '' || v <= maxValue || msg
  }

  const greaterThan = (value, message = null) => {
    const msg = message || `ต้องมากกว่า ${value}`
    return (v) => v === null || v === undefined || v === '' || v > value || msg
  }

  const lessThan = (value, message = null) => {
    const msg = message || `ต้องน้อยกว่า ${value}`
    return (v) => v === null || v === undefined || v === '' || v < value || msg
  }

  const match = (otherValue, message = 'ข้อมูลไม่ตรงกัน') => {
    return (v) => v === otherValue || message
  }

  const url = (message = 'รูปแบบ URL ไม่ถูกต้อง') => {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return (v) => !v || pattern.test(v) || message
  }

  const numeric = (message = 'กรุณากรอกตัวเลขเท่านั้น') => {
    return (v) => !v || /^\d+$/.test(v) || message
  }

  const decimal = (message = 'กรุณากรอกตัวเลขทศนิยม') => {
    return (v) => !v || /^\d+(\.\d+)?$/.test(v) || message
  }

  // รวม rules ที่ใช้บ่อย
  const requiredEmail = () => {
    return [required('กรุณากรอกอีเมล'), email()]
  }

  const requiredPassword = (minLen = 6) => {
    return [
      required('กรุณากรอกรหัสผ่าน'),
      minLength(minLen, `รหัสผ่านต้องมีอย่างน้อย ${minLen} ตัวอักษร`)
    ]
  }

  const requiredRange = (minValue, maxValue) => {
    return [
      required('กรุณากรอกข้อมูล'),
      min(minValue),
      max(maxValue)
    ]
  }

  return {
    required,
    requiredNumber,
    email,
    minLength,
    maxLength,
    min,
    max,
    greaterThan,
    lessThan,
    match,
    url,
    numeric,
    decimal,
    requiredEmail,
    requiredPassword,
    requiredRange
  }
}
