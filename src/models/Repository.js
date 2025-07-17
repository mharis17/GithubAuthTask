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
  homepage: {
    type: String
  },
  language: {
    type: String
  },
  default_branch: {
    type: String,
    default: 'main'
  },
  
  // Repository settings
  private: {
    type: Boolean,
    default: false
  },
  fork: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  has_issues: {
    type: Boolean,
    default: true
  },
  has_projects: {
    type: Boolean,
    default: false
  },
  has_downloads: {
    type: Boolean,
    default: true
  },
  has_wiki: {
    type: Boolean,
    default: true
  },
  has_pages: {
    type: Boolean,
    default: false
  },
  has_discussions: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stargazers_count: {
    type: Number,
    default: 0
  },
  watchers_count: {
    type: Number,
    default: 0
  },
  forks_count: {
    type: Number,
    default: 0
  },
  open_issues_count: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 0
  },
  
  // Dates
  created_at: {
    type: Date
  },
  updated_at: {
    type: Date
  },
  pushed_at: {
    type: Date
  },
  
  // URLs
  html_url: {
    type: String
  },
  clone_url: {
    type: String
  },
  git_url: {
    type: String
  },
  ssh_url: {
    type: String
  },
  svn_url: {
    type: String
  },
  
  // Owner information
  owner: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
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
repositorySchema.index({ 'owner.login': 1 });

const Repository = mongoose.model('Repository', repositorySchema);

export default Repository; 