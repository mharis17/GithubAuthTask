import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  // GitHub OAuth details
  github_id: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  display_name: {
    type: String
  },
  email: {
    type: String
  },
  access_token: {
    type: String,
    required: true
  },
  refresh_token: {
    type: String
  },
  
  // Integration status
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  },
  
  // GitHub profile data
  profile: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Sync information
  last_sync: {
    type: Date
  },
  sync_status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
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
  collection: 'github_integrations'
});

// Indexes
integrationSchema.index({ github_id: 1 });
integrationSchema.index({ username: 1 });
integrationSchema.index({ status: 1 });

const Integration = mongoose.model('Integration', integrationSchema);

export default Integration; 