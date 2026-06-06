const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[<>"'`;]/g, '')
    .replace(/\$/g, '');
};

const sanitizeObject = (input) => {
  if (Array.isArray(input)) {
    return input.map(sanitizeObject);
  }
  if (input && typeof input === 'object') {
    return Object.keys(input).reduce((sanitized, key) => {
      if (key.startsWith('$') || key.includes('.')) return sanitized;
      sanitized[key] = sanitizeObject(input[key]);
      return sanitized;
    }, {});
  }
  return sanitizeString(input);
};

module.exports = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};