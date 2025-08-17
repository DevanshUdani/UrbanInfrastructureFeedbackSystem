
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NOTIF_CHANNELS = ['email','push','sms','webhook'];
const NOTIF_TYPES = ['ISSUE_STATUS_CHANGED','ISSUE_ASSIGNED','NEW_COMMENT','WORKORDER_STATUS_CHANGED'];

const NotificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIF_TYPES, required: true },
    channels: [{ type: String, enum: NOTIF_CHANNELS, default: 'email' }],
    issue: { type: Types.ObjectId, ref: 'Issue' },
    workOrder: { type: Types.ObjectId, ref: 'WorkOrder' },
    payload: { type: Schema.Types.Mixed },
    sentAt: { type: Date },
    error: { type: String },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
