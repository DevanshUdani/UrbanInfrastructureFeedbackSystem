
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const ISSUE_TYPES = [
  'POTHOLE',
  'STREET_LIGHT',
  'GRAFFITI',
  'TRASH',
  'WATER_LEAK',
  'SIDEWALK',
  'SIGNAGE',
  'OTHER',
];

const ISSUE_STATUS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 && v.every(n => typeof n === 'number'),
        message: 'coordinates must be [lng, lat]',
      },
    },
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    storage: { type: String, enum: ['s3', 'gcs', 'azure', 'local', 'gridfs'], default: 'local' },
    key: { type: String, required: true },
    url: { type: String },
    contentType: { type: String },
    size: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    caption: { type: String, trim: true },
    uploadedBy: { type: Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const StatusEventSchema = new Schema(
  {
    status: { type: String, enum: ISSUE_STATUS, required: true },
    note: { type: String, trim: true },
    by: { type: Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const IssueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 5000 },
    type: { type: String, enum: ISSUE_TYPES, required: true, index: true },
    status: { type: String, enum: ISSUE_STATUS, default: 'OPEN', index: true },
    priority: { type: String, enum: PRIORITY, default: 'MEDIUM', index: true },

    reporter: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Types.ObjectId, ref: 'User', index: true },

    location: {
      geo: { type: GeoPointSchema, required: true },
      address: { type: String, trim: true },
      suburb: { type: String, trim: true },
      postcode: { type: String, trim: true },
      council: { type: String, trim: true },
    },

    photos: { type: [AttachmentSchema], default: [] },

    openedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },

    statusHistory: { type: [StatusEventSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    duplicateOf: { type: Types.ObjectId, ref: 'Issue' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

IssueSchema.index({ 'location.geo': '2dsphere' });
IssueSchema.index({ type: 1, status: 1, priority: 1, openedAt: -1 });
IssueSchema.index({ reporter: 1, openedAt: -1 });
IssueSchema.index({ assignedTo: 1, status: 1 });
IssueSchema.index({ title: 'text', description: 'text', tags: 'text' });

IssueSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const by = this.$locals?.actorId || this.assignedTo || this.reporter;
    this.statusHistory.push({ status: this.status, by, at: new Date() });
    if (this.status === 'IN_PROGRESS' && !this.startedAt) this.startedAt = new Date();
    if (this.status === 'RESOLVED' && !this.resolvedAt) this.resolvedAt = new Date();
    if (this.status === 'CLOSED' && !this.closedAt) this.closedAt = new Date();
  }
  next();
});

module.exports = {
  Issue: mongoose.model('Issue', IssueSchema),
  ISSUE_STATUS,
  ISSUE_TYPES,
  PRIORITY,
};
