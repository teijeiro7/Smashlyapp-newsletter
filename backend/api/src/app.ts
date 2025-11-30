import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { validateConfig } from './config';
import logger from './config/logger';

// Importar rutas
import healthRoutes from './routes/health';
import newsletterRoutes from './routes/newsletterRoutes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';

// Validar configuración al iniciar
validateConfig();

// Crear la aplicación Express
const app = express();

// Trust proxy - required when behind Render/Cloudflare
// This allows Express to correctly identify client IPs from X-Forwarded-For header
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        // Permitir conexiones a la API desde el frontend
        // En producción, mantener mismo origen (self) y localhost:443
        // En desarrollo, permitir orígenes de Vite (5173) y websockets
        connectSrc:
          process.env.NODE_ENV === 'production'
            ? ["'self'", 'https://localhost:443']
            : [
                "'self'",
                'https://localhost:443',
                'http://localhost:5173',
                'https://localhost:5173',
                'ws:',
                'wss:',
              ],
      },
    },
  })
);

// CORS configuration
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
      .map(url => url.trim())
      .filter(Boolean)
  : [];

const localhostUrls = [
  'http://localhost:443',
  'http://localhost:5173',
  'https://localhost:443',
  'https://localhost:5173',
];

// In production, use only FRONTEND_URL
// In development, use FRONTEND_URL if set, otherwise use localhost
const corsOrigins =
  process.env.NODE_ENV === 'production'
    ? frontendUrls
    : frontendUrls.length > 0
    ? [...frontendUrls, ...localhostUrls]
    : localhostUrls;

// Log CORS configuration on startup (solo en desarrollo para reducir tiempo de arranque)
if (process.env.NODE_ENV !== 'production') {
  logger.info(`CORS configured for origins: ${JSON.stringify(corsOrigins)}`);
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
}

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;

  // Solo log en desarrollo para reducir overhead
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`OPTIONS preflight request from origin: ${origin}`);
    logger.info(`Allowed origins: ${JSON.stringify(corsOrigins)}`);
  }

  if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`✅ CORS: Allowing preflight from ${origin}`);
    }
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).send();
  }

  // Even when rejecting, send CORS headers so browser can show proper error
  logger.error(`❌ CORS: Rejecting preflight from ${origin}`);
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(403).json({
    error: 'CORS policy violation',
    message: `Origin ${origin} is not allowed. Allowed origins: ${corsOrigins.join(', ')}`,
  });
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        if (process.env.NODE_ENV !== 'production') {
          logger.info('CORS: Allowing request with no origin');
        }
        return callback(null, true);
      }

      // Log the incoming origin (solo en desarrollo)
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`CORS: Request from origin: ${origin}`);
      }

      // Check if origin is allowed
      if (corsOrigins.length === 0) {
        logger.warn('CORS: No origins configured, allowing all origins');
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        if (process.env.NODE_ENV !== 'production') {
          logger.info(`CORS: Origin ${origin} is allowed`);
        }
        callback(null, true);
      } else {
        logger.warn(
          `CORS: Origin ${origin} is NOT in allowed list: ${JSON.stringify(corsOrigins)}`
        );
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/', limiter);

// Middleware general
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas principales
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/newsletter', newsletterRoutes); // Rutas de newsletter

// Swagger UI - solo en desarrollo para reducir tiempo de arranque en producción
if (process.env.NODE_ENV !== 'production') {
  try {
    // Apuntar a la carpeta docs en la raíz del proyecto (para GitHub Pages)
    const swaggerPath = path.join(__dirname, '../../../docs/api-docs.yaml');
    const swaggerDocument = YAML.load(swaggerPath);

    // UI en /api-docs
    app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Spec JSON en /api-docs/spec
    app.get('/api/v1/api-docs/spec', (req, res) => {
      res.json(swaggerDocument);
    });

    logger.info('📚 Swagger UI disponible en /api/v1/api-docs');
  } catch (err) {
    logger.warn('Swagger UI no iniciado: no se pudo cargar docs/api-docs.yaml', err);
  }
}

// Servir frontend estático (build de Vite) desde ../static si existe
const staticDir = path.join(__dirname, '../static');
if (fs.existsSync(staticDir)) {
  // Archivos estáticos
  app.use(express.static(staticDir));

  // Fallback SPA: cualquier ruta que no empiece por /api/ devuelve index.html
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Endpoint de documentación básica
app.get('/api/v1/docs', (req, res) => {
  res.json({
    title: 'Smashly API Documentation',
    version: '1.0.0',
    description: 'REST API for padel racket management system',
    endpoints: {
      health: 'GET /api/health - Health check',
      auth: {
        'POST /api/auth/login': 'Login',
        'POST /api/auth/register': 'Register user',
        'POST /api/auth/logout': 'Logout',
        'POST /api/auth/refresh': 'Refresh token',
        'GET /api/auth/me': 'Get current user',
      },
      rackets: {
        'GET /api/rackets': 'Get all rackets',
        'GET /api/rackets/:id': 'Get racket by ID',
        'GET /api/rackets/search': 'Search rackets',
        'GET /api/rackets/brands/:brand': 'Rackets by brand',
        'GET /api/rackets/bestsellers': 'Bestseller rackets',
        'GET /api/rackets/offers': 'Rackets on sale',
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'POST /api/users/profile': 'Create user profile',
        'PUT /api/users/profile': 'Update user profile',
        'DELETE /api/users/profile': 'Delete user profile',
      },
    },
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🏓 Smashly API - Padel Racket Management System',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/v1/health',
      '/api/v1/auth',
      '/api/v1/rackets',
      '/api/v1/users',
      '/api/v1/docs',
      '/api/v1/reviews',
    ],
  });
});

// Middleware global de manejo de errores
app.use(
  (
    err: Error & { isJoi?: boolean; details?: Array<{ message: string }>; code?: string },
    req: express.Request,
    res: express.Response
  ) => {
    logger.error('❌ Error:', err);

    // Error de validación de Joi
    if (err.isJoi && err.details) {
      return res.status(400).json({
        error: 'Validation error',
        details: err.details.map(detail => detail.message),
      });
    }

    // Error de Supabase
    if (err.code && err.message) {
      return res.status(400).json({
        error: 'Database error',
        message: err.message,
        code: err.code,
      });
    }

    // Error genérico
    return res.status((err as any).status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

export default app;
