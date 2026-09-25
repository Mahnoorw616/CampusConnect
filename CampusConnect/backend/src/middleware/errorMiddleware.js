const notFound = (req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(error.errors).map((item) => item.message).join(', ') });
  if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'A user with that email already exists' });
  return res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
};

module.exports = { notFound, errorHandler };
