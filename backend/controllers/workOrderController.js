
const { WorkOrder, WORK_STATUS } = require('../models/WorkOrder');
const Audit = require('../models/Audit');

const createWorkOrder = async (req, res) => {
  try {
    const { issue, assignee, status, eta, notes } = req.body;
    const wo = await WorkOrder.create({
      issue, assignee,
      assignedBy: req.user._id,
      status: status || 'ASSIGNED',
      eta, notes,
    });
    await Audit.create({
      actor: req.user._id,
      action: 'WORKORDER_CREATED',
      entity: { kind: 'WorkOrder', id: wo._id },
      details: { issue: wo.issue, assignee: wo.assignee },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json(wo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ message: 'Work order not found' });
    const { status, eta, notes, assignee } = req.body;
    if (status && !WORK_STATUS.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    if (typeof status !== 'undefined') wo.status = status;
    if (typeof eta !== 'undefined') wo.eta = eta;
    if (typeof notes !== 'undefined') wo.notes = notes;
    if (typeof assignee !== 'undefined') wo.assignee = assignee;
    await wo.save();
    await Audit.create({
      actor: req.user._id,
      action: 'WORKORDER_UPDATED',
      entity: { kind: 'WorkOrder', id: wo._id },
      details: { fields: Object.keys(req.body) },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(wo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listWorkOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.issue) filter.issue = req.query.issue;
    const items = await WorkOrder.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createWorkOrder, updateWorkOrder, listWorkOrders };
