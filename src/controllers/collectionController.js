import models from '../models/index.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import mongoose from 'mongoose';

// List all available collections/entities
const listCollections = asyncHandler(async (req, res) => {
  const collectionNames = Object.keys(models);
  return successResponse(res, collectionNames, 'Collections/entities listed successfully');
});

// Dynamic data fetch for any collection
const fetchCollectionData = asyncHandler(async (req, res) => {
  const { collectionName } = req.params;
  const Model = models[collectionName];
  if (!Model) {
    return errorResponse(res, `Collection '${collectionName}' not found`, 404);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortField = req.query.sortField || '_id';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  const sort = { [sortField]: sortOrder };

  // Filtering (all query params except reserved ones)
  const reserved = ['page', 'limit', 'sortField', 'sortOrder', 'search'];
  const filters = {};
  Object.keys(req.query).forEach(key => {
    if (!reserved.includes(key)) {
      filters[key] = req.query[key];
    }
  });

  // Global search (case-insensitive, partial match on all string fields)
  let searchQuery = {};
  if (req.query.search) {
    // Get all string fields from schema
    const stringFields = Object.entries(Model.schema.paths)
      .filter(([k, v]) => v.instance === 'String')
      .map(([k]) => k);
    if (stringFields.length > 0) {
      searchQuery = {
        $or: stringFields.map(field => ({ [field]: { $regex: req.query.search, $options: 'i' } }))
      };
    }
  }

  // Combine filters and search
  const mongoQuery = Object.keys(searchQuery).length > 0 ? { $and: [filters, searchQuery] } : filters;

  // Fetch data
  const [data, total] = await Promise.all([
    Model.find(mongoQuery).sort(sort).skip(skip).limit(limit),
    Model.countDocuments(mongoQuery)
  ]);

  // Get all possible field names (from schema and sample data)
  const schemaFields = Object.keys(Model.schema.paths);
  const sample = data[0] ? Object.keys(data[0].toObject()) : [];
  const fields = Array.from(new Set([...schemaFields, ...sample]));

  // Field types (optional)
  const fieldTypes = {};
  fields.forEach(field => {
    const path = Model.schema.paths[field];
    if (path) fieldTypes[field] = path.instance;
    else if (data[0] && data[0][field] !== undefined) fieldTypes[field] = typeof data[0][field];
  });

  // Pagination info
  const totalPages = Math.ceil(total / limit);
  const pagination = { page, limit, total, totalPages };

  return successResponse(res, { fields, data, pagination, fieldTypes }, 'Collection data fetched successfully');
});

export { listCollections, fetchCollectionData }; 