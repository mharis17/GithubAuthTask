import mongoose from 'mongoose';

const pullRequestSchema = new mongoose.Schema({
  // GitHub pull request ID
  github_id: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Pull request details
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
  merged_at: {
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
  collection: 'github_pull_requests'
});

// Indexes
pullRequestSchema.index({ github_id: 1 });
pullRequestSchema.index({ repository_id: 1 });
pullRequestSchema.index({ organization_id: 1 });
pullRequestSchema.index({ integration_id: 1 });
pullRequestSchema.index({ state: 1 });
pullRequestSchema.index({ created_at: -1 });
pullRequestSchema.index({ title: 'text', body: 'text' }); // Text index for search

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

export default PullRequest; 