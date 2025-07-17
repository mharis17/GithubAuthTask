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
  locked: {
    type: Boolean,
    default: false
  },
  draft: {
    type: Boolean,
    default: false
  },
  
  // Branch information
  head: {
    label: String,
    ref: String,
    sha: String,
    user: {
      login: String,
      github_id: Number,
      type: String,
      avatar_url: String,
      html_url: String
    },
    repo: {
      id: Number,
      name: String,
      full_name: String,
      private: Boolean,
      html_url: String
    }
  },
  base: {
    label: String,
    ref: String,
    sha: String,
    user: {
      login: String,
      github_id: Number,
      type: String,
      avatar_url: String,
      html_url: String
    },
    repo: {
      id: Number,
      name: String,
      full_name: String,
      private: Boolean,
      html_url: String
    }
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
  requested_reviewers: [{
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  }],
  
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
  
  // Statistics
  comments: {
    type: Number,
    default: 0
  },
  review_comments: {
    type: Number,
    default: 0
  },
  commits: {
    type: Number,
    default: 0
  },
  additions: {
    type: Number,
    default: 0
  },
  deletions: {
    type: Number,
    default: 0
  },
  changed_files: {
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
  merged_at: {
    type: Date
  },
  
  // URLs
  html_url: {
    type: String
  },
  diff_url: {
    type: String
  },
  patch_url: {
    type: String
  },
  issue_url: {
    type: String
  },
  comments_url: {
    type: String
  },
  review_comments_url: {
    type: String
  },
  commits_url: {
    type: String
  },
  statuses_url: {
    type: String
  },
  
  // Merge information
  merged: {
    type: Boolean,
    default: false
  },
  mergeable: {
    type: Boolean
  },
  mergeable_state: {
    type: String
  },
  merged_by: {
    login: String,
    github_id: Number,
    type: String,
    avatar_url: String,
    html_url: String
  },
  merge_commit_sha: {
    type: String
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
  collection: 'github_pull_requests'
});

// Indexes
pullRequestSchema.index({ github_id: 1 });
pullRequestSchema.index({ repository_id: 1 });
pullRequestSchema.index({ organization_id: 1 });
pullRequestSchema.index({ integration_id: 1 });
pullRequestSchema.index({ 'user.login': 1 });
pullRequestSchema.index({ state: 1 });
pullRequestSchema.index({ created_at: -1 });
pullRequestSchema.index({ title: 'text', body: 'text' }); // Text index for search

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

export default PullRequest; 