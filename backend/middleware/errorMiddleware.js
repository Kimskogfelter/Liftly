// URL:er eller rutter som inte finns
// fångar upp URL:er/routrar som inte finns (404)
export const notFoundEndpoint = (req, res, next) => {
  res.status(404).json({
    message: `Not found - ${req.originalUrl}`
  });
};

// middleware för error
// skickar statuskod och felmeddelande till klienten
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Hämta statuskod men kontrollera att det är ett giltigt heltal
  let statusCode = error.code || error.statusCode || error.status || 500;
  let errorMessage = error.message || "An unknown error occured.";

  // Om koden är en sträng (t.ex. Multer-fel som 'LIMIT_FILE_SIZE'), sätt lämplig statuskod
  if (typeof statusCode !== 'number' || isNaN(statusCode)) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 400 : 500;
  }

  // Om filen överskrider tillåten storlek, ge ett tydligt meddelande med 150MB-gränsen
  if (error.code === 'LIMIT_FILE_SIZE') {
    errorMessage = "File too large. Max file size is 150MB.";
  }

  res.status(statusCode).json({
    message: errorMessage
  });
};