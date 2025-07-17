import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  // GitHub organization ID
  github_id: {
    type: Number,
    required: true
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
organizationSchema.index({ github_id: 1 }, { unique: true });
organizationSchema.index({ login: 1 });
organizationSchema.index({ integration_id: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization; 