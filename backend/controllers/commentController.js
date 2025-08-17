
const Comment = require('../models/Comment');
const Audit = require('../models/Audit');

const addComment = async (req, res) => {
  try {
    const { body, attachments, isInternal } = req.body;
    
    // Validation
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required' });
    }
    
    if (body.length > 5000) {
      return res.status(400).json({ message: 'Comment is too long (max 5000 characters)' });
    }
    
    const comment = await Comment.create({
      issue: req.params.issueId,
      author: req.user._id,
      body: body.trim(),
      attachments: attachments || [],
      isInternal: !!isInternal,
    });
    
    await Audit.create({
      actor: req.user._id,
      action: 'COMMENT_ADDED',
      entity: { kind: 'Issue', id: req.params.issueId },
      details: { comment: comment._id },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(400).json({ message: err.message });
  }
};

const listComments = async (req, res) => {
  try {
    const filter = { issue: req.params.issueId };
    if (!req.user || req.user.role === 'CITIZEN') {
      filter.isInternal = false;
    }
    const items = await Comment.find(filter).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { addComment, listComments };
