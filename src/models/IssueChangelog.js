import mongoose from 'mongoose';

const issueChangelogSchema = new mongoose.Schema({
  // GitHub event ID
  github_id: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Event details
  event: {
    type: String,
    required: true
  },
  actor: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  
  // Issue reference
  issue_number: {
    type: Number,
    required: true
  },
  
  // Event specific data
  commit_id: {
    type: String
  },
  commit_url: {
    type: String
  },
  
  // Label changes
  label: {
    name: String,
    color: String
  },
  
  // Assignee changes
  assignee: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  
  // Milestone changes
  milestone: {
    title: String,
    number: Number
  },
  
  // Rename changes
  rename: {
    from: String,
    to: String
  },
  
  // Review changes
  review_requester: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  requested_reviewer: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  
  // Dates
  created_at: {
    type: Date
  },
  
  // URLs
  url: {
    type: String
  },
  
  // Issue reference
  issue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
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
  collection: 'github_issue_changelogs'
});

// Indexes
issueChangelogSchema.index({ github_id: 1 });
issueChangelogSchema.index({ issue_id: 1 });
issueChangelogSchema.index({ repository_id: 1 });
issueChangelogSchema.index({ organization_id: 1 });
issueChangelogSchema.index({ integration_id: 1 });
issueChangelogSchema.index({ event: 1 });
issueChangelogSchema.index({ created_at: -1 });
issueChangelogSchema.index({ 'actor.login': 1 });

const IssueChangelog = mongoose.model('IssueChangelog', issueChangelogSchema);

export default IssueChangelog; 