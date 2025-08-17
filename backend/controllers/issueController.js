
const { Issue, ISSUE_STATUS, PRIORITY } = require('../models/Issue');
const Comment = require('../models/Comment');
const Audit = require('../models/Audit');

// Create a new issue
const createIssue = async (req, res) => {
  try {
    const { title, description, type, priority, location, photos, tags } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!type || !['POTHOLE', 'STREET_LIGHT', 'GRAFFITI', 'TRASH', 'WATER_LEAK', 'SIDEWALK', 'SIGNAGE', 'OTHER'].includes(type)) {
      return res.status(400).json({ message: 'Valid issue type is required' });
    }
    
    if (!location || !location.geo || !location.geo.coordinates) {
      return res.status(400).json({ message: 'Valid location with coordinates is required' });
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      priority: priority || 'MEDIUM',
      reporter: req.user._id,
      location,
      photos: photos || [],
      tags: tags || [],
    });

    await Audit.create({
      actor: req.user._id,
      action: 'ISSUE_CREATED',
      entity: { kind: 'Issue', id: issue._id },
      details: { title: issue.title, type: issue.type },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get issues list with filters
const listIssues = async (req, res) => {
  try {
    const { status, type, q, assignedTo, reporter, before, after, lng, lat, maxDistance } = req.query;
    const filter = { isDeleted: false };

    if (status) filter.status = { $in: String(status).split(',') };
    if (type) filter.type = { $in: String(type).split(',') };
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reporter) filter.reporter = reporter;
    if (after) filter.createdAt = { ...(filter.createdAt || {}), $gte: new Date(after) };
    if (before) filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(before) };

    let query = Issue.find(filter);

    if (q) {
      query = query.find({ $text: { $search: q } });
    }

    if (lng && lat && maxDistance) {
      query = query.find({
        'location.geo': {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(maxDistance),
          },
        },
      });
    }

    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = (page - 1) * limit;

    const [items, count] = await Promise.all([
      query.sort({ createdAt: -1 }).skip(skip).limit(limit),
      Issue.countDocuments(filter),
    ]);

    res.json({ items, count, page, limit });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get single issue
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reporter', 'name email');
    if (!issue || issue.isDeleted) return res.status(404).json({ message: 'Issue not found' });
    
    // Get comments for this issue
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ issue: issue._id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    
    // Format comments for frontend
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      text: comment.body,
      authorName: comment.author.name,
      createdAt: comment.createdAt,
      isInternal: comment.isInternal
    }));
    
    const issueWithComments = {
      ...issue.toObject(),
      comments: formattedComments
    };
    
    res.json(issueWithComments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update issue (basic fields)
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.isDeleted) return res.status(404).json({ message: 'Issue not found' });

    const allowed = ['title','description','type','priority','location','tags','assignedTo'];
    for (const k of allowed) {
      if (typeof req.body[k] !== 'undefined') issue[k] = req.body[k];
    }

    await issue.save();
    await Audit.create({
      actor: req.user._id,
      action: 'ISSUE_UPDATED',
      entity: { kind: 'Issue', id: issue._id },
      details: { updatedFields: Object.keys(req.body) },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Change status
const changeStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.isDeleted) return res.status(404).json({ message: 'Issue not found' });
    if (!ISSUE_STATUS.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    issue.status = status;
    issue.$locals = { actorId: req.user._id };
    if (note) {
      // push a note as a statusHistory entry
      issue.statusHistory.push({ status, note, by: req.user._id, at: new Date() });
    }
    await issue.save();

    await Audit.create({
      actor: req.user._id,
      action: 'ISSUE_STATUS_CHANGED',
      entity: { kind: 'Issue', id: issue._id },
      details: { status, note },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Soft delete
const removeIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.isDeleted) return res.status(404).json({ message: 'Issue not found' });
    issue.isDeleted = true;
    await issue.save();
    await Audit.create({
      actor: req.user._id,
      action: 'ISSUE_DELETED',
      entity: { kind: 'Issue', id: issue._id },
      details: {},
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createIssue, listIssues, getIssue, updateIssue, changeStatus, removeIssue };
