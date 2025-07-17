import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  // GitHub repository ID
  github_id: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Repository details
  name: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  language: {
    type: String
  },
  private: {
    type: Boolean,
    default: false
  },
  
  // URLs
  html_url: {
    type: String
  },
  clone_url: {
    type: String
  },
  
  // Owner information
  owner: {
    login: String,
    github_id: Number,
    avatar_url: String
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
  collection: 'github_repositories'
});

// Indexes
repositorySchema.index({ github_id: 1 });
repositorySchema.index({ full_name: 1 });
repositorySchema.index({ organization_id: 1 });
repositorySchema.index({ integration_id: 1 });

const Repository = mongoose.model('Repository', repositorySchema);

export default Repository; 