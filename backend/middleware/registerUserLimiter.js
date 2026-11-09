import rateLimit from 'express-rate-limit';

export const registerUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
    message: { message: 'Too many accounts created from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        console.log(`⚠️ BLOCKED! IP: ${req.ip} nådde gränsen.`);
        res.status(options.statusCode).json(options.message);
    },
    // Lägg till denna för att se varje anrop i terminalen
    skip: (req, res) => {
        console.log(`🔍 Registreringsförsök från IP: ${req.ip}`);
        return false;
    }
});