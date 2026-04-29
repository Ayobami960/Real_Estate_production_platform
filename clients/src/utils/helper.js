
export const sanitizeInput = (value) => {
    const injectionPattern =
        /<\s*(script|iframe|object|embed|form|input|link|meta|style|img)[^>]*>|on\w+\s*=|javascript\s*:|data\s*:|vbscript\s*:|(\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bSELECT\b|\bUNION\b|\bEXEC\b)\s+/i;

    if (injectionPattern.test(value)) return null; 

    return value.replace(/<[^>]*>/g, "");
};


export const validateName = (name) => {
    const trimmed = name?.trim() ?? "";
    if (!trimmed) return "Full name is required.";
    if (trimmed.length < 5) return "Name must be at least 5 characters.";
    if (trimmed.length > 35) return "Name must not exceed 2 characters.";
    if (!/^[a-zA-Z\s'\-]+$/.test(trimmed))
        return "Name can only contain letters, spaces, hyphens, or apostrophes.";
    return null;
};


export const validateEmail = (email) => {
    const trimmed = email?.trim() ?? "";
    if (!trimmed) return "Email address is required.";
    if (trimmed.length > 60) return "Email address is too long.";

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";

    const blockedDomains = [
        "mailinator.com",
        "tempmail.com",
        "guerrillamail.com",
        "10minutemail.com",
        "yopmail.com",
    ];
    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (blockedDomains.includes(domain))
        return "Disposable email addresses are not allowed.";

    return null;
};


export const validateRegisterPassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 20) return "Password must not exceed 64 characters.";
    if (!/[A-Z]/.test(password))
        return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
        return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
        return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        return "Password must contain at least one special character (e.g. @, #, $, !).";

    const commonPasswords = ["Password1!", "Passw0rd!", "Admin@123", "Welcome1!"];
    if (commonPasswords.includes(password))
        return "This password is too common. Please choose a stronger one.";

    return null;
};


export const validateLoginPassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 20) return "Password must not exceed 64 characters.";
     if (!/[A-Z]/.test(password))
        return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
        return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password))
        return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        return "Password must contain at least one special character (e.g. @, #, $, !).";

    return null;
};

/**
 * Password strength checklist items — used to render the live hint list.
 * Each item has a label and a test function that accepts the current password.
 */
export const passwordStrengthRules = [
    { label: "At least 8 characters",    test: (p) => p.length >= 8 },
    { label: "One uppercase letter",      test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",      test: (p) => /[a-z]/.test(p) },
    { label: "One number",                test: (p) => /[0-9]/.test(p) },
    { label: "One special character",     test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];