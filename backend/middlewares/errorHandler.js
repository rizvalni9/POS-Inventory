/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parsing errors in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format payload JSON tidak valid.'
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errorDetails = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: err.errors[0]?.message || 'Data yang dikirim tidak memenuhi validasi sistem.',
      errors: errorDetails
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errorDetails = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(409).json({
      success: false,
      message: err.errors[0]?.message || 'Data sudah terdaftar dan tidak boleh duplikat.',
      errors: errorDetails
    });
  }

  // Handle custom status errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Details]:', err);
  } else {
    console.error(`[Error ${statusCode}]:`, err.message);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Terjadi kesalahan sistem internal. Silakan hubungi tim administrator.' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Handler for undefined API routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan pada server API ini.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
