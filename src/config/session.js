import session from 'express-session';
import MongoStore from 'connect-mongo';
import logger from '../../utils/logger.js';

const configureSession = () => {
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  };

  logger.info('Session configuration completed');
  return sessionConfig;
};

export default configureSession; 