
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const AuditSchema = new Schema(
  {
    actor: { type: Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { kind: { type: String, enum: ['Issue','Comment','WorkOrder','User'], required: true },
              id: { type: Types.ObjectId, required: true } },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true, versionKey: false }
);

AuditSchema.index({ 'entity.kind': 1, 'entity.id': 1, createdAt: -1 });

module.exports = mongoose.model('Audit', AuditSchema);
