import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  // GitHub issue ID
  github_id: {
    type: Number,
    required: true,
    unique: true
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
  locked: {
    type: Boolean,
    default: false
  },
  
  // User information
  user: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  assignees: [{
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  }],
  assignee: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  
  // Labels and milestones
  labels: [{
    id: Number,
    name: String,
    color: String,
    description: String
  }],
  milestone: {
    id: Number,
    number: Number,
    title: String,
    description: String,
    state: String,
    due_on: Date
  },
  
  // Comments and reactions
  comments: {
    type: Number,
    default: 0
  },
  reactions: {
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
  closed_at: {
    type: Date
  },
  
  // URLs
  html_url: {
    type: String
  },
  comments_url: {
    type: String
  },
  events_url: {
    type: String
  },
  labels_url: {
    type: String
  },
  repository_url: {
    type: String
  },
  assignees_url: {
    type: String
  },
  pulls_url: {
    type: String
  },
  
  // Pull request information
  pull_request: {
    url: String,
    html_url: String,
    diff_url: String,
    patch_url: String
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
issueSchema.index({ github_id: 1 });
issueSchema.index({ repository_id: 1 });
issueSchema.index({ organization_id: 1 });
issueSchema.index({ integration_id: 1 });
issueSchema.index({ 'user.login': 1 });
issueSchema.index({ state: 1 });
issueSchema.index({ created_at: -1 });
issueSchema.index({ title: 'text', body: 'text' }); // Text index for search

const Issue = mongoose.model('Issue', issueSchema);

export default Issue; 