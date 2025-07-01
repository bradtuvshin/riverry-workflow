const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  taskId: {
    type: String,
    unique: true
  },
  sku: {
    type: String,
    required: true
  },
  paintingStyle: {
    type: String,
    required: true,
    enum: ['portrait', 'landscape', 'pet_portrait', 'family_portrait', 'abstract', 'realistic', 'cartoon', 'watercolor']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'submitted', 'needs_revision', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  dueDate: {
    type: Date,
    required: true
  },
  startedAt: Date,
  submittedAt: Date,
  completedAt: Date,
  payRate: {
    type: Number,
    required: true,
    min: 0
  },
  bonusRate: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  workFiles: [{
    url: String,
    filename: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  revisions: [{
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    instructions: String,
    requestedAt: { type: Date, default: Date.now },
    completedAt: Date
  }],
  timeTracking: {
    estimatedHours: Number,
    actualHours: Number,
    startTime: Date,
    endTime: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.index({ taskId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

taskSchema.pre('save', async function(next) {
  if (!this.taskId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      taskId: new RegExp(`^T${year}`)
    });
    this.taskId = `T${year}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

taskSchema.virtual('isOverdue').get(function() {
  return this.daysUntilDue < 0;
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
