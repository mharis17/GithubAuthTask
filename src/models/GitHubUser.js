import mongoose from 'mongoose';

const gitHubUserSchema = new mongoose.Schema({
  // GitHub user ID
  github_id: {
    type: Number,
    required: true,
    unique: true
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
  bio: {
    type: String
  },
  company: {
    type: String
  },
  blog: {
    type: String
  },
  location: {
    type: String
  },
  hireable: {
    type: Boolean
  },
  twitter_username: {
    type: String
  },
  
  // User statistics
  public_repos: {
    type: Number,
    default: 0
  },
  public_gists: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
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
  
  // URLs
  html_url: {
    type: String
  },
  avatar_url: {
    type: String
  },
  gravatar_id: {
    type: String
  },
  followers_url: {
    type: String
  },
  following_url: {
    type: String
  },
  gists_url: {
    type: String
  },
  starred_url: {
    type: String
  },
  subscriptions_url: {
    type: String
  },
  organizations_url: {
    type: String
  },
  repos_url: {
    type: String
  },
  events_url: {
    type: String
  },
  received_events_url: {
    type: String
  },
  
  // User type
  type: {
    type: String,
    default: 'User'
  },
  
  // Site admin status
  site_admin: {
    type: Boolean,
    default: false
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
gitHubUserSchema.index({ github_id: 1 });
gitHubUserSchema.index({ login: 1 });
gitHubUserSchema.index({ integration_id: 1 });
gitHubUserSchema.index({ type: 1 });
gitHubUserSchema.index({ created_at: -1 });

const GitHubUser = mongoose.model('GitHubUser', gitHubUserSchema);

export default GitHubUser; 