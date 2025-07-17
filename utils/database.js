import mongoose from 'mongoose';
import logger from './logger.js';

// Database query utilities
const paginateQuery = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Database validation utilities
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Database cleanup utilities
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Database connection status
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get database stats
const getDbStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    return null;
  }
};

export {
  paginateQuery,
  isValidObjectId,
  closeConnection,
  isConnected,
  getDbStats,
}; 