import rateLimit from 'express-rate-limit';

export const registerUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuter
    max: 5, // Max 5 försök
    message: { message: 'Too many account creation attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    
    // Den här körs på VARJE anrop som träffar routen och loggar i din VS Code-terminal
    skip: (req, res) => {
        console.log(`🔍 Registreringsförsök från IP: ${req.ip}`);
        return false; // Returnerar false för att INTE hoppa över limitern
    },

    handler: (req, res, next, options) => {
        console.log(`⚠️ BLOCKED! IP: ${req.ip} nådde gränsen.`);
        res.status(options.statusCode).json(options.message);
    }
});