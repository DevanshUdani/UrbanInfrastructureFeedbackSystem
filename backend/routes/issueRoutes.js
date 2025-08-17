
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createIssue, listIssues, getIssue, updateIssue, changeStatus, removeIssue
} = require('../controllers/issueController');
const { addComment, listComments } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);
router.post('/', createIssue);
router.get('/', listIssues);
router.get('/:id', getIssue);
router.put('/:id', updateIssue);
router.patch('/:id/status', changeStatus);
router.delete('/:id', removeIssue);

// nested comments
router.post('/:issueId/comments', addComment);
router.get('/:issueId/comments', listComments);

module.exports = router;
