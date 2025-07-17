import mongoose from 'mongoose';

const commitSchema = new mongoose.Schema({
  // GitHub commit SHA
  sha: {
    type: String,
    required: true,
    unique: true
  },
  
  // Commit details
  message: {
    type: String,
    required: true
  },
  author: {
    name: String,
    email: String,
    date: Date
  },
  committer: {
    name: String,
    email: String,
    date: Date
  },
  
  // Commit metadata
  tree: {
    sha: String,
    url: String
  },
  parents: [{
    sha: String,
    url: String,
    html_url: String
  }],
  
  // Verification
  verification: {
    verified: {
      type: Boolean,
      default: false
    },
    reason: String,
    signature: String,
    payload: String
  },
  
  // URLs
  url: {
    type: String
  },
  html_url: {
    type: String
  },
  comments_url: {
    type: String
  },
  
  // Commit statistics
  comment_count: {
    type: Number,
    default: 0
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
  
  // Branch information
  branch: {
    type: String,
    default: 'main'
  },
  
  // Author information
  author_uuid: {
    type: String
  },
  author_name: {
    type: String
  },
  author_login: {
    type: String
  },
  author_avatar_url: {
    type: String
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
  collection: 'github_commits'
});

// Indexes
commitSchema.index({ sha: 1 });
commitSchema.index({ repository_id: 1 });
commitSchema.index({ organization_id: 1 });
commitSchema.index({ integration_id: 1 });
commitSchema.index({ 'author.login': 1 });
commitSchema.index({ 'author.date': -1 });
commitSchema.index({ message: 'text' }); // Text index for search

const Commit = mongoose.model('Commit', commitSchema);

export default Commit; 