
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const AttachmentSchema = new Schema(
  {
    storage: { type: String, enum: ['s3', 'gcs', 'azure', 'local', 'gridfs'], default: 'local' },
    key: { type: String, required: true },
    url: { type: String },
    contentType: { type: String },
    size: { type: Number, min: 0 },
    caption: { type: String, trim: true },
    uploadedBy: { type: Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CommentSchema = new Schema(
  {
    issue: { type: Types.ObjectId, ref: 'Issue', required: true, index: true },
    author: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    attachments: { type: [AttachmentSchema], default: [] },
    isInternal: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

CommentSchema.index({ issue: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
