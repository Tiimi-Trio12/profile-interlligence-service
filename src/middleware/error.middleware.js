function errorHandler(err, req, res, next) {

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON body'
    });
  }

  if (Number.isInteger(err?.statusCode)) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message || 'Internal server error'
    });
  }

  if (err.message === 'Name is required') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'Profile already exists'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found'
    });
  }

  // External API failure case
  if (typeof err?.message === 'string' && err.message.includes('returned an invalid response')) {
    return res.status(502).json({
      status: 'error',
      message: err.message
    });
  }

  // Not found case
  if (err.message === 'Profile not found') {
    return res.status(404).json({
      status: 'error',
      message: err.message
    });
  }

  if (err.message === 'Invalid query parameters') {
    return res.status(422).json({
      status: 'error',
      message: err.message
    });
  }

  // Default server error
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}

module.exports = errorHandler;