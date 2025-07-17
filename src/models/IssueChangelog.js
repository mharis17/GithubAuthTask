import mongoose from 'mongoose';

const issueChangelogSchema = new mongoose.Schema({
  // GitHub event ID
  github_id: {
    type: Number,
    required: true
  },
  
  // Event details
  event: {
    type: String,
    required: true
  },
  actor: {
    login: String,
    github_id: Number,
    avatar_url: String
  },
  
  // Issue reference
  issue_number: {
    type: Number,
    required: true
  },
  
  // Dates
  created_at: {
    type: Date
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
issueChangelogSchema.index({ github_id: 1 }, { unique: true });
issueChangelogSchema.index({ issue_id: 1 });
issueChangelogSchema.index({ repository_id: 1 });
issueChangelogSchema.index({ organization_id: 1 });
issueChangelogSchema.index({ integration_id: 1 });
issueChangelogSchema.index({ event: 1 });
issueChangelogSchema.index({ created_at: -1 });

const IssueChangelog = mongoose.model('IssueChangelog', issueChangelogSchema);

export default IssueChangelog; 