
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const WORK_STATUS = ['PENDING','ASSIGNED','IN_PROGRESS','ON_HOLD','DONE','CANCELLED'];

const WorkOrderSchema = new Schema(
  {
    issue: { type: Types.ObjectId, ref: 'Issue', required: true, index: true },
    assignee: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: WORK_STATUS, default: 'ASSIGNED', index: true },
    eta: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

WorkOrderSchema.index({ assignee: 1, status: 1, eta: 1 });

module.exports = {
  WorkOrder: mongoose.model('WorkOrder', WorkOrderSchema),
  WORK_STATUS,
};
