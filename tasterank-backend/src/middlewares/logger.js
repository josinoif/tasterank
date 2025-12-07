/**
 * Middleware de logging de requisições
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Interceptar o método res.json para capturar status
  const originalJson = res.json.bind(res);
  
  res.json = function(body) {
    const duration = Date.now() - start;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    if (process.env.NODE_ENV === 'development' && req.method !== 'GET') {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    
    return originalJson(body);
  };
  
  next();
};

module.exports = { requestLogger };