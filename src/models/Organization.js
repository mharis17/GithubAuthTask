import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  // GitHub organization ID
  github_id: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Organization details
  login: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  description: {
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
  email: {
    type: String
  },
  twitter_username: {
    type: String
  },
  
  // Organization settings
  is_verified: {
    type: Boolean,
    default: false
  },
  has_organization_projects: {
    type: Boolean,
    default: false
  },
  has_repository_projects: {
    type: Boolean,
    default: false
  },
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
  
  // URLs
  html_url: {
    type: String
  },
  avatar_url: {
    type: String
  },
  
  // Integration reference
  integration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  
  // Audit fields
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'github_organizations'
});

// Indexes
organizationSchema.index({ github_id: 1 });
organizationSchema.index({ login: 1 });
organizationSchema.index({ integration_id: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization; 