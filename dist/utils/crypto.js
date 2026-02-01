import crypto from 'crypto';
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        otp += digits[randomIndex];
    }
    return otp;
};
export const generateToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};
export const generateUUID = () => {
    return crypto.randomUUID();
};
//# sourceMappingURL=crypto.js.map