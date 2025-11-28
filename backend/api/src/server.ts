import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';
import logger from './config/logger';

// Cargar variables de entorno
dotenv.config();

const PORT = parseInt(process.env.PORT || '10000', 10);
// Render requires binding to 0.0.0.0 (all interfaces) not just localhost
const HOST = process.env.HOST || '0.0.0.0';
// Solo usar HTTPS si USE_HTTPS está explícitamente configurado como "true"
const USE_HTTPS = process.env.USE_HTTPS === 'true';

let server;

console.log('🔧 [Server] Starting server configuration...');
console.log('🔧 [Server] PORT:', PORT);
console.log('🔧 [Server] HOST:', HOST);
console.log('🔧 [Server] USE_HTTPS:', USE_HTTPS);
console.log('🔧 [Server] NODE_ENV:', process.env.NODE_ENV);

if (USE_HTTPS) {
  // Configuración HTTPS
  const certPath = path.join(__dirname, '../certs/cert.pem');
  const keyPath = path.join(__dirname, '../certs/key.pem');

  // Verificar que existen los certificados
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    logger.error('❌ Error: No se encontraron los certificados SSL');
    logger.error(`   Cert path: ${certPath}`);
    logger.error(`   Key path: ${keyPath}`);
    logger.error('   Por favor, genera los certificados SSL primero.');
    process.exit(1);
  }

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  server = https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
    logger.info(`🚀 Smashly API server running on ${HOST}:${PORT} (HTTPS)`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: https://localhost:${PORT}/api/v1/health`);
    logger.info(`📚 API Documentation: https://localhost:${PORT}/api/v1/docs`);
    console.log(`✅ [Server] HTTPS server listening on ${HOST}:${PORT}`);
  });
} else {
  // Configuración HTTP
  server = app.listen(PORT, HOST, () => {
    logger.info(`🚀 Smashly API server running on ${HOST}:${PORT} (HTTP)`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    console.log(`✅ [Server] HTTP server listening on ${HOST}:${PORT}`);
    console.log(`✅ [Server] Server is ready to accept connections`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });
});

export default server;
