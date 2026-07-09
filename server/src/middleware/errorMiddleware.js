const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  if (process.env.NODE_ENV !== 'test') {
    console.error({
      message: err.message,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
