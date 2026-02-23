// Bangladesh phone number validation
export function validatePhoneNumber(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Bangladesh phone numbers: 11 digits starting with 01
  // Format: 01X-XXXX-XXXX or similar
  const bdPhoneRegex = /^(?:\+880|0)?1[3-9]\d{8}$/
  return bdPhoneRegex.test(cleaned)
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// OTP validation
export function validateOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

// Bangladesh address validation
export function validateBangladeshAddress(address: {
  division?: string
  district?: string
  thana?: string
  fullAddress?: string
}): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!address.division || address.division.trim() === '') {
    errors.push('Division is required')
  }
  if (!address.district || address.district.trim() === '') {
    errors.push('District is required')
  }
  if (!address.thana || address.thana.trim() === '') {
    errors.push('Thana/Upazila is required')
  }
  if (!address.fullAddress || address.fullAddress.trim() === '') {
    errors.push('Full address is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Price validation
export function validatePrice(price: number | string): boolean {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return !isNaN(num) && num > 0
}

// Product name validation
export function validateProductName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().length <= 255
}

// URL validation
export function validateImageUrl(url: string): boolean {
  try {
    new URL(url)
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  } catch {
    return false
  }
}

// Quantity validation
export function validateQuantity(quantity: number | string): boolean {
  const num = typeof quantity === 'string' ? parseInt(quantity) : quantity
  return Number.isInteger(num) && num > 0 && num <= 1000
}
