export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
}

export const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return re.test(String(password))
}

export const validateHandle = (handle: string) => {
    const re = /^[a-zA-Z0-9_]{3,20}$/
    return re.test(String(handle))
}

export const isEmpty = (str: string) => !str || str.trim() === ''

export const isEmailValid = (email: string) => {
    if (isEmpty(email)) return 'Email is required'
    if (!validateEmail(email)) return 'Email is invalid'
    return ''
}

export const isPasswordValid = (password: string) => {
    if (isEmpty(password)) return 'Password is required'
    if (!validatePassword(password)) return 'Password must be at least 8 characters long and contain at least one letter and one number'
    return ''
}

export const isConfirmPasswordValid = (password: string, confirmPassword: string) => {
    if (isEmpty(confirmPassword)) return 'Please confirm your password'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
}

export const isHandleValid = (handle: string) => {
    if (isEmpty(handle)) return 'Handle is required'
    if (!validateHandle(handle)) return 'Handle must be 3-20 characters long and can only contain letters, numbers, and underscores'
    return ''
}

export const isNameValid = (name: string) => {
    if (isEmpty(name)) return 'Name is required'
    if (name.length < 3 || name.length > 100) return 'Name must be between 3 and 100 characters long'
    return ''
}