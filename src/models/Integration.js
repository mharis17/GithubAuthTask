import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  // GitHub OAuth details
  github_id: {
    type: Number,
    required: true
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
  
  // Integration status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
integrationSchema.index({ github_id: 1 }, { unique: true });
integrationSchema.index({ username: 1 });

const Integration = mongoose.model('Integration', integrationSchema);

export default Integration; 