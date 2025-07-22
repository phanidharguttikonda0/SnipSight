
export function isValidUsernName(input) {
    const allowedChars = /^[a-zA-Z0-9_]{5,}$/;
    return allowedChars.test(input);
}

export function isValidEmail(input) {
    const allowedChars = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ ;
    return allowedChars.test(input);
}

export function isValidMobile(input) {
    const allowedChars = /^[0-9]{10}$/;
    return allowedChars.test(input);
}
