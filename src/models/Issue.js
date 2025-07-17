import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  // GitHub issue ID
  github_id: {
    type: Number,
    required: true
  },
  
  // Issue details
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String
  },
  state: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  
  // User information
  user: {
    login: String,
    github_id: Number,
    avatar_url: String
  },
  
  // Repository information
  repository_name: {
    type: String,
    required: true
  },
  repository_uuid: {
    type: String,
    required: true
  },
  
  // URLs
  html_url: {
    type: String
  },
  
  // Dates
  created_at: {
    type: Date
  },
  updated_at: {
    type: Date
  },
  closed_at: {
    type: Date
  },
  
  // Repository reference
  repository_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  
  // Organization reference
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // Integration reference
  integration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  
  // Audit fields
  created_at_db: {
    type: Date,
    default: Date.now
  },
  updated_at_db: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at_db', updatedAt: 'updated_at_db' },
  collection: 'github_issues'
});

// Indexes
issueSchema.index({ github_id: 1 }, { unique: true });
issueSchema.index({ repository_id: 1 });
issueSchema.index({ organization_id: 1 });
issueSchema.index({ integration_id: 1 });
issueSchema.index({ state: 1 });
issueSchema.index({ created_at: -1 });
issueSchema.index({ title: 'text', body: 'text' }); // Text index for search

const Issue = mongoose.model('Issue', issueSchema);

export default Issue; 