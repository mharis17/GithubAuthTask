import mongoose from 'mongoose';

const gitHubUserSchema = new mongoose.Schema({
  // GitHub user ID
  github_id: {
    type: Number,
    required: true
  },
  
  // User details
  login: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  avatar_url: {
    type: String
  },
  html_url: {
    type: String
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
  collection: 'github_users'
});

// Indexes
gitHubUserSchema.index({ github_id: 1 }, { unique: true });
gitHubUserSchema.index({ login: 1 });
gitHubUserSchema.index({ integration_id: 1 });

const GitHubUser = mongoose.model('GitHubUser', gitHubUserSchema);

export default GitHubUser; 