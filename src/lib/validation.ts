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