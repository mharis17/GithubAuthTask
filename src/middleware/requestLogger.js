import logger from '../../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.info({
    type: 'REQUEST',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info({
      type: 'RESPONSE',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger; 